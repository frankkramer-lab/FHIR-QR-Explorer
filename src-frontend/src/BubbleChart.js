import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { generateDatasetStatsByFilterNode, countEntries } from './FilterQueryPanel';

ChartJS.register(CategoryScale, PointElement, Title, Tooltip, Legend);

class BubbleChart extends React.Component {
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
              {qx_idx < 0 && <li>Select a valid question for x-axis.</li>}
              {qy_idx < 0 && <li>Select a valid question for y-axis.</li>}
            </ul>
          </div>
        );
        n_filtered = countEntries(this.props.filterSQL, this.props.data);
      } else {
        // valid questions selected -> render chartbox
        const qx_txt = texts[qx_idx];
        const qy_txt = texts[qy_idx];

        const stats = generateDatasetStatsByFilterNode(this.props.filterSQL, this.props.data, [qx_idx, qy_idx]);
        n_filtered = stats.flat().reduce((acc, itm)=>acc+itm, 0);

        const qx_labels = labels[qx_idx];
        const qy_labels = labels[qy_idx];
        const total_px_space = 150 * 150;

        function countsToRadius(counts) {
          return Math.sqrt(counts * total_px_space / n_filtered / Math.PI);
        }

        const p_ds = {
          "datasets": [{
            "label": "",
            "data": qx_labels.map((qx_l, qx_l_idx) => qy_labels.map((qy_l, qy_l_idx) => ({
                x: qx_l, // Categorical axis -> provide str value
                y: qy_l, // Categorical axis -> provide str value
                r: countsToRadius(stats[qx_l_idx][qy_l_idx])
            }))).flat(),
            "backgroundColor": 'rgba(53, 162, 235, 0.8)'
          }],
        };

        const p_ops = {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: qx_txt + " || " + qy_txt,
            },
            tooltip: {
              callbacks: {
                label: (ctx) => "Counts: " + stats[ctx.parsed.x][ctx.parsed.y].toString()
              }
            }
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
              type: 'category',
              labels: qy_labels,
              title:  {
                display: true,
                text: qy_txt,
              }
            }
          }
        };

        // render chart
        chartbox = (<Bubble options={p_ops} data={p_ds} />);
      }

      // Question X option field
      // We do not use qid here but it could be used.
      let qx_field_options = question_ids.map((qid, idx) => (<option  key={idx} value={idx}>{texts[idx]}</option>))
      let qx_field = (
        <div className='form-group'>
          <label htmlFor="qx_select">Question on x-axis</label>
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
          <label htmlFor="qy_select">Question on y-axis</label>
          <select className="form-control" id="qy_select" value={this.state.questionY} onChange={(e)=>{this.setState({questionY: parseInt(e.target.value)})}}>
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

export default BubbleChart;
