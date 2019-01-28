import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DonorBarChart.scss'
import { select } from 'd3-selection'
import { scaleBand,scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { format } from 'd3-format'
import { makeTooltip } from '../../VizHelpers'
import _ from 'lodash'
import { default as tip } from 'd3-tip'


class DonorBarChart extends Component {
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
    // select('.d3-tip').remove();

    let tooltip = tip()
      .attr('class', 'd3-tip')
      .offset([0, -20])
      .direction(d => 'w')
      .html((d) => {
        return makeTooltip(
          d.year,
          [
            {label:"Number of projects", value:d.projects},
            {label:"Amount Awarded", value:"£"+format(",.0f")(d.amount)}
          ]
        )
      })

    // console.log(data);

    var margin = {top: 10, right: 10, bottom: 40, left: 60},
    width = 300 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom,
    node = select(this.node);

    const values = data.values.map(d => d.value['total_awarded']);
    const dataForChart = data.values
      .map(d => 
        ({
          year:parseInt(d.key),
          amount:d.value['total_awarded'],
          projects:d.value['projects']
        }) 
      );

    // set the ranges
    var x = scaleBand()
              .range([0, width])
              .domain([2013,2014,2015,2016,2017,2018])
              .padding(0.1);
    var y = scaleLinear()
              .range([height, 0])
              .domain([0,_.max(values)]);


    // console.log(values);

    node.selectAll("g").remove();
  
    const g = node.append('g');
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll(".bar")
      .data(dataForChart)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { 
        return x(d.year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.amount); })
      .attr("fill", '#6e40e6')
      // .attr("fill", '#602f8f')
      .attr("height", function(d) { return height - y(d.amount); })
      .on('mouseover', function(d) {
        tooltip.show(d,this);
        select(this)
          .attr("fill", "#f48320");
      })
      .on('mouseout', function(d) {
        tooltip.hide();
        select(this)
          .attr("fill", '#6e40e6');
      });

    // add the x Axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x));

    // add the y Axis
    g.append("g")
    .call(axisLeft(y)
      .ticks(4)
      .tickFormat(function(d) {return "£"+format(".3s")(d)
        .replace('M', ' mil')
        .replace('G', ' bil')
      }));
    

    node.call(tooltip);
  }

  render() {
    return (
      <div className="DonorBarChart">
        <svg className="StackedBarChart" ref={node => this.node = node}
          width={300} height={150}>
        </svg>
      </div>
    );
}
}

DonorBarChart.propTypes = {}

DonorBarChart.defaultProps = {}

export default DonorBarChart

