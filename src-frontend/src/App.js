import React from "react";
import { getHostPrefix, DB_QUESTION_PREFIX, DB_TBL } from "./settings";
import ChartPanel from "./ChartPanel";
import initSqlJs from "sql.js";

// WASM copy
import sqlWasm from "!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question_data: null,
      error: null
    };

    this.reloadData.bind(this);
  }

  async reloadData() {
    console.log("(Re)load data...");
    // Load FHIR query url
    const fhir_query = await fetch(new URL(getHostPrefix() + "fhir-query.json", window.location.href).href)
    .then(response => response.json())
    .then(data => {
      if (data === null) throw Error("No FHIR query found.");
      return data;
    }).catch(err => {
      this.setState({question_data: null, error: err.toString()});
      return null;
    });

    // Stop if error occurred
    if (fhir_query == null) return;

    const fhir_url = fhir_query["url"];
    const fhir_fetch = fhir_query["fetch"] || {
      headers: {"Accept": "application/fhir+json"},
    };

    // Load FHIR QuestionnaireResponses
    let questionnaires = [];
    let next_url = fhir_url;
    while (true) {
      // Stop at last page
      if (next_url == null) break;

      // Load data
      let result_data = await fetch(next_url, fhir_fetch)
        .then(response => response.json())
        .then(data => {
          if (data === null) throw Error("No FHIR data found.");
          return data
        }).catch(err => {
          this.setState({question_data: null, error: err.toString()});
          return null;
      });
      // Deaktivate next_url
      next_url = null;

      // Check if payload is a Bundle
      if (result_data["resourceType"] === "Bundle"){
        // Extract Questionnaire Responses
        let qr_data = result_data["entry"].filter(entry => (entry["resource"] || {})["resourceType"] === "QuestionnaireResponse");
        // Append to questionnaire list
        questionnaires = questionnaires.concat(qr_data);

        // Find pagination link
        if ((result_data["link"]||[]).length > 0) {
          let pagination_link = (result_data["link"]||[]).filter((l) => l["relation"] === "next");
          if (pagination_link.length == 1) next_url = pagination_link[0]["url"];
        }
      }
    }
    // Break up if no questionnaires were found.
    if (questionnaires.length == 0) {
      this.setState({question_data: null, error: "No questionnaires found."});
      return null;
    }

    // Define method to recursively extract answers from item nodes
    function getQuestionResponses(root_item, question_path) {
      let question_text = [];
      if (root_item.hasOwnProperty("text")) question_text = [root_item["text"]];

      // If answer exists, we are at a leaf node and can return the item answer
      if (root_item.hasOwnProperty('answer')) {
        // We assume that only one valueString-answer exists
        return [
          {
            "question": question_path.concat(question_text),
            "id": root_item["linkId"],
            "answer": root_item["answer"][0]["valueString"]
        }];
      }
      else if (Array.isArray(root_item["item"])) {
        // Parse list of items recursively
        return root_item["item"].map(item => getQuestionResponses(item, question_path.concat(question_text))).flat();
      } else {
        // Unkown case: No list but no leaf
        console.log("Found non-list, non-leaf node:", root_item);
        return [];
      }
    }

    // Extract all non-empty responses
    // We assume that the identifier has a unique string-property 'value'
    let question_responses = questionnaires.map(entry => {
      let questions = getQuestionResponses(entry["resource"], []);
      return {"id": entry["resource"]["identifier"][0]["value"], "questions": questions };
    }).filter(item => item["questions"].length > 0);

    if (question_responses.length == 0) {
      this.setState({question_data: null, error: "Empty FHIR response bundle :("});
      return;
    }

    // Extract all question texts from the first item
    let texts = question_responses[0]["questions"].map((q) =>  q["question"].map(s => s.replace(/:+$/, '')).join(" / "));
    let question_ids = question_responses[0]["questions"].map((q) => q["id"]);

    // Collect valid rows first
    let rows = [];
    question_responses.forEach(qr => {
      // Check if all answers are available and are the expected ones.

      // Answers match the expected schema
      let valid = true;
      let row = {"qr_id": qr["id"]}

      // Validate question alignment
      qr["questions"].forEach((q, q_idx) => {
        // Invalidate row if question does not align well.
        if (question_ids[q_idx] != q["id"]) {
          valid = false;
        }
      });

      if (valid) {
        row["qr"] = qr;
        rows.push(row);
      } else {
        // Answers do not align to questions from question texts -> skip answer
        console.log("Non-uniform answer set detected. Skip following item:", qr);
      }
    });

    // Now, determine labels for each question
    let labels = Array(texts.length);
    question_ids.forEach((_, q_idx) => {
      labels[q_idx] = rows.reduce((labels_acc, row) => {
        let answer = row["qr"]["questions"][q_idx]["answer"];
        if (!labels_acc.includes(answer))
          labels_acc.push(answer);
        return labels_acc;
      }, []);
    });

    // Replace row items, add label_idx for each answer
    rows = rows.map((row) => {
      return {
        "qr_id": row["qr_id"],
        "answers": row["qr"]["questions"].map((q, q_idx) => labels[q_idx].indexOf(q["answer"]))
      }
    });

    // Init DB
    const SQL = await initSqlJs({ locateFile: () => sqlWasm });
    const db = new SQL.Database();
    // create DB table
    const createTbl = "CREATE TABLE " + DB_TBL + " (qr_id TEXT, " + question_ids.map((qid, idx) => DB_QUESTION_PREFIX + idx.toString() + " INT").join(", ") + ");";
    db.run(createTbl);

    // Insert rows
    const insertTbl = "INSERT INTO " + DB_TBL + " VALUES (" + Array(question_ids.length + 1).fill("?").join(", ") + ")";
    rows.forEach((row) => {
      let values = [row["qr_id"]].concat(row["answers"].map((_, idx)=> row["answers"][idx]));
      db.run(insertTbl, values);
    });

    let final_data = {
      "question_ids": question_ids,
      "texts": texts,
      "labels": labels,
      "db": db,
      "n_total": rows.length
    };

    // Set final state
    console.log("Data loaded.")
    this.setState({question_data: final_data, error: null});
  }

  componentDidMount() {
    this.reloadData();
  }

  render() {
    if (this.state.error !== null)
      return (<>
        <h6>Loading error</h6>
        <div>{this.state.error}</div>
        <button type="button" className="btn btn-primary" onClick={() => this.reloadData()}>Reload</button>
      </>)
    if (this.state.question_data == null)
      return (<div>Loading data...</div>);

    return (
        <>
          <div className="badge badge-secondary p-2 m-1">#Responses: { this.state.question_data.n_total } (total)</div>
          <ChartPanel
            data={this.state.question_data}
          />

          <button
            type="button"
            className="btn btn-primary btn-sm m-3"
            onClick={()=>{this.setState({question_data: null, error: null});; this.reloadData();}}>
              Reload
          </button>
        </>
    );
  }
}

export default App;
