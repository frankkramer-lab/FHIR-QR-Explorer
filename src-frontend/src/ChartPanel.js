import React from 'react';
import BarChartBasic from './BarChartBasic';
import BarChartTwoAxes from './BarChartTwoAxes';
import BubbleChart from './BubbleChart';
import FilterPanel from './FilterQueryPanel';

class ChartPanel extends React.Component {
    constructor(props) {
        super(props);

        this.chart_types = ["Basic Bar Chart", "Two-Axis Bar Chart", "Bubble Chart"];
        this.state = {
          chart: 0,
          filterCfg: {item: 0},
          filterSQL: null,
        };
    }

    render() {
        if (this.props.data == null)
            return <>Loading..</>;

        // Chart type selection field
        let charttype_options = this.chart_types.map((_, idx) => (<option key={idx} value={idx}>{this.chart_types[idx]}</option>))
        let charttype_field = (
          <div className='form-group'>
            <label htmlFor="charttype_select">Chart Type</label>
            <select className="form-control" id="charttype_select" value={this.state.chart} onChange={(e)=>{this.setState({chart: parseInt(e.target.value)})}}>
              {charttype_options}
            </select>
          </div>
        );

        let filter_component = <FilterPanel data={this.props.data} updateFilterSQL={(filterSQL)=>{this.setState({filterSQL: filterSQL});}}/>;

        let chart_component = null;
        if (this.state.filterSQL === null) {
          chart_component = (
            <>
              <div>Apply filter rule first.</div>
              <hr/>
            </>
          );
        } else {
          // Chart component rendering
          if (this.chart_types[this.state.chart] === "Basic Bar Chart")
            chart_component = (<BarChartBasic
              data={this.props.data}
              filterSQL={this.state.filterSQL}
            />);
          if (this.chart_types[this.state.chart] === "Two-Axis Bar Chart")
            chart_component = (<BarChartTwoAxes
              data={this.props.data}
              filterSQL={this.state.filterSQL}
            />);
          if (this.chart_types[this.state.chart] === "Bubble Chart")
            chart_component = (<BubbleChart
              data={this.props.data}
              filterSQL={this.state.filterSQL}
            />);
          if (chart_component == null)
              chart_component = (<p>Unknown chart selected.</p>);
        }

        return (
          <>
            { charttype_field }
            <hr/>
            { filter_component }
            <hr/>
            { chart_component }
          </>
        );
    }
}

export default ChartPanel;
