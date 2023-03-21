import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { generateDatasetStatsByFilterNode, countEntries } from './FilterQueryPanel';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

class BarChartBasic extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            question: -1,
        };
    }

    render() {
      const { question_ids, texts, labels, db, n_total} = this.props.data;
      const q_idx = this.state.question;

      let chartbox = null;
      let n_filtered = null;
      if (q_idx < 0) {
        // Question IDs are not valid
        chartbox = (
          <div className="alert alert-warning">
            <ul>
              <li>Select a valid question.</li>
            </ul>
          </div>
        );
        n_filtered = countEntries(this.props.filterSQL, this.props.data);
      } else {
        // valid questions selected -> render chartbox

        const q_txt = texts[q_idx];

        const stats = generateDatasetStatsByFilterNode(this.props.filterSQL, this.props.data, [q_idx]);
        n_filtered = stats.flat().reduce((acc, itm)=>acc+itm, 0);

        const p_labels = labels[q_idx];
        const p_data = stats;

        const p_ds = {
          "labels": p_labels,
          "datasets": [{
            "label": q_txt,
            "data": p_data,
            "backgroundColor": 'rgba(53, 162, 235, 0.8)'
          }]
        };

        const p_ops = {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: q_txt,
            },
          },
          scales: {
            x: {
              type: 'category',
              labels: p_labels,
              title:  {
                display: true,
                text: q_txt,
              }
            },
            y: {
              ticks: {
                beginAtZero: true,
                callback: function(value) {if (value % 1 === 0) {return value;}}
              },
              title:  {
                display: true,
                text: "Response Counts",
              }
            }
          }
        };

        chartbox = (<Bar options={p_ops} data={p_ds} />);
      }

        // Question option field
        let option_field_options = question_ids.map((qid, idx) => (<option  key={idx} value={idx}>{texts[idx]}</option>))
        let option_field = (
          <div className='form-group'>
            <label htmlFor="q_select">Question</label>
            <select className="form-control" id="q_select" value={this.state.question} onChange={(e)=>{this.setState({question: parseInt(e.target.value)})}}>
              <option value="-1">---</option>
              {option_field_options}
            </select>
          </div>
        );

        // Build filter component
        let filter_info = (
          <small className="font-weight-bold ml-2">Filter applied: {n_filtered} (filtered) / {n_total} (total)</small>
        )
        return (
        <>
          { option_field }
          <hr/>
          { filter_info}
          <hr/>
          { chartbox }
        </>
        );
    }
}

export default BarChartBasic;
