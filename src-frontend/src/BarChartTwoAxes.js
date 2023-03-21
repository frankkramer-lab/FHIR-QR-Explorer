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

// Patch Hash function from https://stackoverflow.com/a/7616484
// adapted for higher randomization on ultra-short strings
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < Math.max(16, this.length); i++) {
    hash =  this.charCodeAt(i%this.length) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Str2Color from https://stackoverflow.com/a/16348977
// adapted
function str2color(str) {
  const hash = str.hashCode();
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).slice(-2);
  }
  return colour;
}

// addAlpha from https://stackoverflow.com/a/68398236
function addAlpha(color, opacity) {
  // coerce values so ti is between 0 and 1.
  var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}


class BarChartTwoAxes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          questionX: -1,
          questionY: -1
        };
    }

    render() {
      const { question_ids, texts, labels, db, n_total} = this.props.data;

      const qx_idx = this.state.questionX;
      const qy_idx = this.state.questionY;

      let chartbox = null;
      let n_filtered = null;
      if (qx_idx < 0 || qy_idx < 0) {
        // Question IDs are not valid
        chartbox = (
          <div className="alert alert-warning">
            <ul>
              {qx_idx < 0 && <li>Select a valid question for first stage grouping.</li>}
              {qy_idx < 0 && <li>Select a valid question for second stage grouping.</li>}
            </ul>
          </div>
        );
        n_filtered = countEntries(this.props.filterSQL, this.props.data);
      } else {
        const qx_txt = texts[qx_idx];
        const qy_txt = texts[qy_idx];

        const stats = generateDatasetStatsByFilterNode(this.props.filterSQL, this.props.data, [qx_idx, qy_idx]);
        n_filtered = stats.flat().reduce((acc, itm)=>acc+itm, 0);

        const qx_labels = labels[qx_idx];
        const qy_labels = labels[qy_idx];

        const p_ds = {
          "labels": qx_labels,
          "datasets": qy_labels.map((qy_l, qy_l_idx) => { return {
            "label": qy_l,
            "data":  qx_labels.map((qx_l, qx_l_idx) => stats[qx_l_idx][qy_l_idx]),
            "backgroundColor": addAlpha(str2color(qy_l), 0.5)
              };}),
        };

        const p_ops = {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: qx_txt,
            },
          },
          scales: {
            x: {
              type: 'category',
              labels: qx_labels,
              title:  {
                display: true,
                text: qx_txt,
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
        // render chart
        chartbox = (<Bar options={p_ops} data={p_ds} />);
      }

      // Question X option field
      // We do not use qid here but it could be used.
      let qx_field_options = question_ids.map((qid, idx) => (<option  key={idx} value={idx}>{texts[idx]}</option>))
      let qx_field = (
        <div className='form-group'>
          <label htmlFor="qx_select">Question for first stage grouping</label>
          <select className="form-control" id="qx_select" value={this.state.questionX} onChange={(e)=>{this.setState({questionX: parseInt(e.target.value)})}}>
            <option value="-1">---</option>
            {qx_field_options}
          </select>
        </div>
      );

      // Question Y option field
      // We do not use qid here but it could be used.
      let qy_field_options = question_ids.map((qid, idx) => (<option  key={idx} value={idx}>{texts[idx]}</option>))
      let qy_field = (
        <div className='form-group'>
          <label htmlFor="qx_select">Question for second stage grouping</label>
          <select className="form-control" id="qx_select" value={this.state.questionY} onChange={(e)=>{this.setState({questionY: parseInt(e.target.value)})}}>
            <option value="-1">---</option>
            {qy_field_options}
          </select>
        </div>
      );

      // Build filter component
      let filter_info = (
        <small className="font-weight-bold ml-2">Filter applied: {n_filtered} (filtered) / {n_total} (total)</small>
      );

      return (
      <>
        { filter_info }
        <hr/>
        { qx_field }
        <hr/>
        { qy_field }
        <hr/>
        { chartbox }
      </>
      );
    }
}

export default BarChartTwoAxes;
