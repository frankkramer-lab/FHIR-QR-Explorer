import React from 'react';
import { DB_TBL, DB_QUESTION_PREFIX } from './settings';

export const FQP_ItemType = ["any", "not", "and", "or", "value"];
export const FQP_ValueOps = ["is", "is not"];
const FQP_ListItems = ["and", "or"];

export class FilterPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          filterCfg: {item: 0}
        };
    }

    render() {
        // Set filtering presets / avoid hard-coding
        let { question_ids, texts, labels, db } = this.props.data;

        let item_any = FQP_ItemType.indexOf("any");
        let item_value = FQP_ItemType.indexOf("value");
        let item_op_is = FQP_ValueOps.indexOf("is");

        // gender
        let qid_gender = question_ids.indexOf("1.1"); // Question ID for gender
        let labels_gender = labels[qid_gender];
        let gender_female_id = labels_gender.indexOf("f");

        // Pflegehelfer
        let qid_profession = question_ids.indexOf("1.3"); // Question ID for position/profession
        let labels_profession = labels[qid_profession];
        let profession_nursingassistant_id = labels_profession.indexOf("Nursing assistant");

        const filtering_choices = [
          {"txt": "All", "filter": {item: item_any}},
          {"txt": "Female only ", "filter": {item: item_value /* == value */, q: qid_gender, q_s: gender_female_id, q_op: item_op_is}},
          {"txt": "Nursing assistant only", "filter": {item: item_value, q: qid_profession, q_s: profession_nursingassistant_id, q_op: item_op_is}},
        ];

        // DataFrame subset panel
        let subset_presets_btns = filtering_choices.map((sus_c, idx) => (
          <button className="btn btn-outline-secondary btn-sm" key={idx} onClick={()=> this.setState({filterCfg: sus_c["filter"]})}>{sus_c["txt"]}</button>
        ))
        let subset_presets = (
          <div className="border border-primary rounded ml-1 p-1">
            <div className="form-check form-check-inline"><span className="px-1 mx-1">Filter examples:</span>
                {subset_presets_btns}
            </div>
          </div>
        );

        return (
          <div className='form-group'>
            <label htmlFor="filter_select">Dataset Filtering</label>
            <div id="filter_select">
              { subset_presets }
              <FilterQueryPanel
                data={this.props.data}
                filterCfg={this.state.filterCfg}
                updateFilterCfg={(filterCfg) => {this.setState({filterCfg: filterCfg})}}
              />
            </div>
            <button className="btn btn-primary btn-sm m-2" onClick={()=>
              this.props.updateFilterSQL(generateSQLByFilterNode(this.state.filterCfg, this.props.data))}
            >apply filter</button>
          </div>
        );
    }
}


class FilterQueryPanel extends React.Component {
    constructor(props) {
        super(props);

        this.changeFilterType.bind(this);
        this.changeChildFilterItem(this);
        this.changeListLength.bind(this);

        this.changeValueQuestion.bind(this);
        this.changeValueOp.bind(this);
        this.changeValueLabelVal.bind(this);
    }

    changeFilterType(updatedItemId) {
        const {itemObj, itemId, itemTxt} = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};

        // Load updated item info
        const updatedItemTxt = FQP_ItemType[updatedItemId];

        // preserve infos if possible
        if (FQP_ListItems.includes(itemTxt) && FQP_ListItems.includes(updatedItemTxt)) {
            // just replace list operand, keep data
            this.props.updateFilterCfg({ ...this.props.filterCfg, item: updatedItemId});
        } else {
            // Change item type and set default data manually
            if (updatedItemTxt === "any") {
                this.props.updateFilterCfg({ item: updatedItemId});
            } else if(updatedItemTxt === "not") {
                // Set to default 'not[any]'
                this.props.updateFilterCfg({ item: updatedItemId, on: {item: 0}});
            } else if(updatedItemTxt === "and") {
                // Set to default 'and@[any,]'
                this.props.updateFilterCfg({ item: updatedItemId, on: [{item: 0}]});
            } else if(updatedItemTxt === "or") {
                // Set to default 'and@[any,]'
                this.props.updateFilterCfg({ item: updatedItemId, on: [{item: 0}]});
            } else if(updatedItemTxt === "value") {
                // Set to default 'value@[question=0, ops=is, selection=0'
                this.props.updateFilterCfg({ item: updatedItemId, q: 0, q_op: 0, q_s: 0 });
            } else {
                console.log("Something went wrong during filter type change...");
            }
        }
    }

    changeChildFilterItem(updatedFilterItem, index=null) {
        const {itemObj, itemId, itemTxt} = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};
        if (FQP_ListItems.includes(itemTxt)) {
            // We are a list item -> need index
            let newOnList = [...this.props.filterCfg["on"]];
            newOnList[index] = updatedFilterItem;
            this.props.updateFilterCfg({...this.props.filterCfg, on: newOnList});
        } else if (itemTxt !== "any"){
            this.props.updateFilterCfg({...this.props.filterCfg, on: updatedFilterItem});
        }
    }

    changeListLength(updatedLength) {
        const {itemObj, itemId, itemTxt} = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};

        // Only change length if we are at a list-related item
        if (FQP_ListItems.includes(itemTxt)) {
            const additional_items = updatedLength - itemObj["on"].length;
            if (additional_items > 0) {
                // Add new item(s)
                this.props.updateFilterCfg({
                    ...this.props.filterCfg,
                    on: this.props.filterCfg["on"].concat(
                        Array(additional_items).fill(0).map((_) => {return {item: 0};})
                    )
                });
            } else if (additional_items < 0) {
                // Remove item
                this.props.updateFilterCfg({
                    ...this.props.filterCfg,
                    on: this.props.filterCfg["on"].slice(0, -1)
                });
            }
        }
    }

    changeValueQuestion(q_index) {
        const { itemObj, itemId, itemTxt } = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};
        if (itemTxt === "value"){
            this.props.updateFilterCfg({
                ...this.props.filterCfg,
                q: q_index,
                q_s: 0,
            });
        }
    }

    changeValueOp(q_op) {
        const { itemObj, itemId, itemTxt } = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};
        if (itemTxt === "value"){
            this.props.updateFilterCfg({
                ...this.props.filterCfg,
                q_op: q_op,
            });
        }
    }

    changeValueLabelVal(q_s) {
        const { itemObj, itemId, itemTxt } = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};
        if (itemTxt === "value"){
            this.props.updateFilterCfg({
                ...this.props.filterCfg,
                q_s: q_s,
            });
        }
    }

    render() {
        const { itemObj, itemId, itemTxt } = {itemObj: this.props.filterCfg, itemId: this.props.filterCfg["item"], itemTxt: FQP_ItemType[this.props.filterCfg["item"]]};

        // Item type selection field
        const item_option_field_items = FQP_ItemType.map((_, idx) => (<option value={idx} key={idx}>{FQP_ItemType[idx]}</option>))
        const item_field = (
            <select className="form-control form-control-sm" value={itemId} onChange={(e)=>{this.changeFilterType(parseInt(e.target.value))}}>
                {item_option_field_items}
            </select>
        );

        // Render type-specific configuration
        if (itemTxt == "any") {
            // Render 'any' config panel
            return (
                <div className="border border-primary rounded ml-1 p-1">
                    <div className="form-check form-check-inline"><span className="badge badge-secondary px-1 mx-1">Any</span>{item_field}</div>
                </div>
            );
        } else if (itemTxt == "not") {
            // Render 'not' config panel
            return (
                <div className="border border-primary rounded ml-1 p-1">
                    <div className="form-check form-check-inline"><span className="badge badge-secondary px-1 mx-1">Not</span>{item_field}</div>
                    <div className="">
                        <FilterQueryPanel data={this.props.data} filterCfg={itemObj["on"]} updateFilterCfg={(f) => this.changeChildFilterItem(f, null)}/>
                    </div>
                </div>
            );
        } else if (itemTxt == "and") {
            // Render 'and' config panel
            return (
                <div className="border border-primary rounded ml-1 p-1">
                    <div className="form-check form-check-inline"><span className="badge badge-secondary px-1 mx-1">And</span>
                        {item_field}
                        <button className="btn btn-outline-danger btn-sm" onClick={()=> this.changeListLength(Math.max(itemObj["on"].length-1, 1))}>reduce</button>
                        <button className="btn btn-outline-success btn-sm" onClick={()=> this.changeListLength(itemObj["on"].length+1)}>append</button>
                    </div>
                    <div className="">
                        {itemObj["on"].map((cItem, idx) => {return (
                            <div className="list-group-item d-flex justify-content-between align-items-center py-1" key={idx}>
                                <FilterQueryPanel data={this.props.data} filterCfg={cItem} updateFilterCfg={(f) => this.changeChildFilterItem(f, idx)}/>
                            </div>
                        );})}
                    </div>
                </div>
            );
        } else if (itemTxt == "or") {
            // Render 'or' config panel
            return (
                <div className="border border-primary rounded ml-1 p-1">
                    <div className="form-check form-check-inline"><span className="badge badge-secondary px-1 mx-1">Or</span>
                        {item_field}
                        <button className="btn btn-outline-danger btn-sm" onClick={()=> this.changeListLength(Math.max(itemObj["on"].length-1, 1))}>reduce</button>
                        <button className="btn btn-outline-success btn-sm" onClick={()=> this.changeListLength(itemObj["on"].length+1)}>append</button>
                    </div>
                    <div className="">
                        {itemObj["on"].map((cItem, idx) => {return (
                            <li className="list-group-item d-flex justify-content-between align-items-center py-1" key={idx}>
                                <FilterQueryPanel data={this.props.data} filterCfg={cItem} updateFilterCfg={(f) => this.changeChildFilterItem(f, idx)}/>
                            </li>
                        );})}
                    </div>
                </div>
            );
        } else if (itemTxt == "value") {
            // Render 'value' config panel
            //const { question_ids, texts, df } = this.props.data;
            const { question_ids, texts, labels, db, n_total} = this.props.data;

            const q_option_field_items = question_ids.map((q_id, idx) => (<option key={idx} value={idx}>{texts[idx]} ({q_id})</option>))
            const q_field = (
                <select className="form-control form-control-sm" value={itemObj["q"]} onChange={(e)=>{this.changeValueQuestion(parseInt(e.target.value))}}>
                    {q_option_field_items}
                </select>
            );

            const q_op_field_items = FQP_ValueOps.map((op, idx) => (<option key={idx} value={idx}>{op}</option>))
            const q_op_field = (
                <select className="form-control form-control-sm" value={itemObj["q_op"]} onChange={(e)=>{this.changeValueOp(parseInt(e.target.value))}}>
                    {q_op_field_items}
                </select>
            )

            // determine question values
            const q_s_field_items = labels[itemObj["q"]].map((l, idx) => (<option key={idx} value={idx}>{l}</option>))
            const q_s_field = (
                <select className="form-control form-control-sm" value={itemObj["q_s"]} onChange={(e)=>{this.changeValueLabelVal(parseInt(e.target.value))}}>
                    {q_s_field_items}
                </select>
            )

            return (
                <div className="border border-primary rounded ml-1 p-1">
                    <div className="form-check form-check-inline"><span className="badge badge-secondary px-1 mx-1">Value</span>{item_field}</div>
                    <div className="form-check form-check-inline p-1">
                        {q_field}
                        {q_op_field}
                        {q_s_field}
                    </div>
                </div>
            );
        } else {
            // Should not be called...
            console.log("Something went wrong during rendering...");
        }
    }
}

export function generateSQLByFilterNode(filter_node, data) {
    // Return the SQL subquery, given a filter node
    const { question_ids, texts, labels, db} = data;
    const itemId = filter_node["item"];
    const itemTxt = FQP_ItemType[itemId];

    if (itemTxt === "any") {
        // Do not apply filtering at all
        return "(SELECT * FROM " + DB_TBL + ")";
    } else if (itemTxt === "not") {
        // Exclude all from child node
        let sql_sub = generateSQLByFilterNode(filter_node["on"], data);
        return "(SELECT * FROM " + DB_TBL + " EXCEPT SELECT * FROM " + sql_sub + ")";
    } else if (itemTxt === "and") {
        let sql_subs = filter_node["on"].map((cnode) => generateSQLByFilterNode(cnode, data));
        return "(" + sql_subs.map(s=> 'SELECT * FROM ' + s).join(" INTERSECT ") + ")";
    } else if (itemTxt === "or") {
        let sql_subs = filter_node["on"].map((cnode) => generateSQLByFilterNode(cnode, data));
        return "(" + sql_subs.map(s=> 'SELECT * FROM ' + s).join(" UNION ") + ")";
    } else if (itemTxt === "value") {
        const op = FQP_ValueOps[filter_node["q_op"]];
        const qid = filter_node["q"];
        const q_s = filter_node["q_s"];
        if (op == "is") {
            return "(SELECT * FROM " + DB_TBL + " WHERE " + DB_QUESTION_PREFIX + qid.toString() + " = " + q_s.toString() + ")";
        } else if (op === "is not") {
            return "(SELECT * FROM " + DB_TBL + " WHERE " + DB_QUESTION_PREFIX + qid.toString() + " != " + q_s.toString() + ")";
        } else {
            console.log("Something went wrong during value filtering...");
        }
    } else {
        console.log("Something went wrong during node filtering...");
    }
}

export function generateDatasetStatsByFilterNode(sql_subquery, data, question_dim_idxs) {
    // Return a filtered dataframe, given a filter node
    const { question_ids, texts, labels, db} = data;

    // Array of label equivalence clauses for each question (by idx)
    // e.g. [ ["(question_3 = 0)", "(question_3 = 1)"], ["(question_5=0)", "(question_5=1)"]]
    let condition_list = question_dim_idxs.map((ql, ql_idx) => labels[ql].map((l, l_idx)=>{
        return "( " + DB_QUESTION_PREFIX + ql.toString() + " = " + l_idx.toString() + " )"
    }));

    // Fill stats matrix
    // e.g. stats[2, 4] => n_entries, where label[q_dim_0] == 2 and label[q_dim_1] == 4
    let stats = null;
    function fillStats(remaining_condition_list, selected_conditions, assign) {
        if (remaining_condition_list.length == 0) {
            // Run actual query
            let sql = "SELECT COUNT(*) FROM " + sql_subquery + " WHERE " + selected_conditions.join(" AND ") + ";"
            let res = db.exec(sql);
            let cnt = res[0].values[0][0];
            assign(cnt);
        } else {
            let current_clist = remaining_condition_list.slice(0,1)[0];
            let remaining_clist = remaining_condition_list.slice(1);

            let stat_entry = Array(current_clist.length).fill([]);
            current_clist.forEach((condition, cidx) => {
                fillStats(remaining_clist, selected_conditions.concat([condition]), (v)=>{stat_entry[cidx]=v});
            });
            assign(stat_entry);
        }
    }
    fillStats(condition_list, [], (v)=>{stats=v;});
    return stats;
}

export function countEntries(sql_subquery, data){
    // Return a filtered dataframe, given a filter node
    const { question_ids, texts, labels, db} = data;

    let sql = "SELECT COUNT(*) FROM " + sql_subquery + ";"
    let res = db.exec(sql);
    let cnt = res[0].values[0][0];

    return cnt;
}
export default FilterPanel;