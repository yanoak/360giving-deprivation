import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DonorBarChart.scss'
import { select } from 'd3-selection'
import { scaleBand,scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import _ from 'lodash'

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

    // console.log(data);

    var margin = {top: 10, right: 10, bottom: 40, left: 60},
    width = 300 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom,
    node = select(this.node);

    const values = data.values.map(d => d.value['total_awarded']);
    const dataForChart = data.values.map(d => ({year:parseInt(d.key),amount:d.value['total_awarded']}) );

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
      .attr("height", function(d) { return height - y(d.amount); });

    // add the x Axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x));

    // add the y Axis
    g.append("g")
    .call(axisLeft(y));
    
    // let tooltip = tip()
    //   .attr('class', 'd3-tip')
    //   .offset([0, 20])
    //   .direction(d => 'e')
    //   .html((d) => {
    //     let [typel1,typel2] = d.type.split(' | ')
    //     typel2 = typel2 ? typel2 : typel1;
    //     return "<div style='font-size:12px; background-color: rgba(255,255,255,0.7); padding:5px'><strong>" + typel2 + "</strong> </span>"
    //     // + "<br/><strong>Revenue type detail:</strong> " + typel2
    //     + "<br/><strong>Revenue ("+this.props.currencyValue+"):</strong> " + format(",.0f")((d[1] - d[0]))
    //     + '</div>';
    //   })

    // node.call(tooltip);
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
