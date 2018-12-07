import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DeprivationScatterPlot.scss'
import { select } from 'd3-selection'
import { scaleBand,scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { extent } from 'd3-array'
import { getColorScale } from '../../DataHelpers'
import _ from 'lodash'


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

      console.log(data);
  
      var margin = {top: 10, right: 10, bottom: 90, left: 90},
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      node = select(this.node);
  
      const xValues = data.map(d => d[this.props.xVal]);
      const yValues = data.map(d => d['Amount Awarded']);
  
      // set the ranges
      var x = scaleLinear()
                .range([0, width])
                .domain(extent(xValues))
                // .padding(0.1);
      var y = scaleLinear()
                .range([height, 0])
                .domain(extent(yValues))

    const colorScale = getColorScale(extent(xValues));

    node.selectAll("g").remove();
  
    const g = node.append('g');
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("stroke", 0.5)
      .attr("cx", d => x(d[this.props.xVal]))
      .attr("cy", d => y(d['Amount Awarded']))
      .attr('fill', d => colorScale(d[this.props.xVal]))



      // add the x Axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x));

    // add the y Axis
    g.append("g")
    .call(axisLeft(y));

    }
    

    render() {
        return (
      <div className="DonorBarChart">
        <svg className="StackedBarChart" ref={node => this.node = node}
          width={400} height={400}>
        </svg>
      </div>
      );
    }
}

DeprivationScatterPlot.propTypes = {}

DeprivationScatterPlot.defaultProps = {}

export default DeprivationScatterPlot
