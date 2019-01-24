// import React, { Component } from 'react'
// import PropTypes from 'prop-types'
// import styles from './DeprivationScatterPlot.scss'

// class DeprivationScatterPlot extends Component {
//     constructor(props) {
//         super(props)
//     }
    
//     render() {
//         return (
//             <div className="DeprivationScatterPlot"></div>
//         );
//     }
// }

// DeprivationScatterPlot.propTypes = {}

// DeprivationScatterPlot.defaultProps = {}

// export default DeprivationScatterPlot


import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DeprivationScatterPlot.scss'
import { select } from 'd3-selection'
import { scaleBand,scaleLinear,scaleLog } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { format } from 'd3-format'
import { extent } from 'd3-array'
import { getColorScale } from '../../VizHelpers'
import _ from 'lodash'
import { default as tip } from 'd3-tip'


class DeprivationScatterPlot extends Component {
    constructor(props){
      super(props)
      this.createBarChart = this.createBarChart.bind(this)
    }
    componentDidMount() {
      this.createBarChart()
    }
    
    componentDidUpdate() {
      this.createBarChart()
    }
    
    createBarChart() {
      let data = this.props.data;

      let tooltip = tip()
      .attr('class', 'd3-tip')
      .offset([0, 20])
      .direction(d => 'e')
      .html((d) => {
        return "<div style='font-size:12px; background-color: rgba(255,255,255,0.7); padding:5px;'><strong>" + d.id + "</strong> </span>"
        + "<br/><strong>"+this.props.xVal+":</strong> " + format(".2s")(d[this.props.xVal])
        + "<br/><strong>Amount Awarded (£):</strong> " + format(",.0f")(d['Amount Awarded'])
        + '</div>';
      })


      console.log(this.props.data);
      data = data.map(d => {
        return {
          'id': d['id'],
          [this.props.xVal]: d[this.props.xVal] ? (+d[this.props.xVal]) : 0,
          'Amount Awarded': d['Amount Awarded'] ? (+d['Amount Awarded']) : 0,
          'filterOn': d.filterOn
        }
      });

      // console.log(data);
  
      var margin = {top: 10, right: 10, bottom: 90, left: 90},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      node = select(this.node);
  
      const xValues = data.map(d => +d[this.props.xVal]);
      const yValues = data.map(d => +d['Amount Awarded']);

      let [yMin, yMax] = extent(yValues);
      yMin = yMin > 0 ? yMin : 10000;
      yMax = yMax > 0 ? yMax : yMin;
      
      // set the ranges
      var x = scaleLinear()
                .range([0, width])
                .domain(extent(xValues))
                // .padding(0.1);
      var y = scaleLog()
                .range([height, 0])
                .domain([yMin,yMax])
          
    const colorScale = getColorScale(extent(xValues));

    node.selectAll("g").remove();
  
    const g = node.append('g');
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll(".dot")
      .data(data.filter(d => +d['Amount Awarded']>=yMin))
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("stroke", '#999')
      .attr("cx", d => x(+d[this.props.xVal]))
      .attr("cy", d => {
        return +d['Amount Awarded'] > yMin ? y(+d['Amount Awarded']) : yMin;
      })
      .attr('fill', d => d['filterOn'] ? colorScale(+d[this.props.xVal]) : 'rgba(255,255,255,0.7)')
      .on('mousemove', tooltip.show)
      .on('mouseout', tooltip.hide);

    node.call(tooltip);



      // add the x Axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x).tickFormat(format(".3s")));

    // add the y Axis
    g.append("g")
    .call(axisLeft(y)
      .ticks(4)  
      .tickFormat(function(d) {return "£"+format(".3s")(d)} ));

    }
    

    render() {
        return (
      <div className="DonorBarChart">
        <svg className="StackedBarChart" ref={node => this.node = node}
          width={500} height={500}>
        </svg>
      </div>
      );
    }
}

DeprivationScatterPlot.propTypes = {}

DeprivationScatterPlot.defaultProps = {}

export default DeprivationScatterPlot
