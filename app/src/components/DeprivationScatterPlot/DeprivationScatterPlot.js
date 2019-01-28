import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './DeprivationScatterPlot.scss'
import { select } from 'd3-selection'
import { scaleBand,scaleLinear,scaleLog } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { format } from 'd3-format'
import { extent } from 'd3-array'
import { getColorScale, convertHex, makeTooltip } from '../../VizHelpers'
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
      const filterFunc = this.props.addFilter;
      select('.d3-tip').remove();

      const opacity = 100;

      let tooltip = tip()
      .attr('class', 'd3-tip')
      .offset([0, 20])
      .direction(d => 'e')
      .html((d) => {
        console.log(d);
        return makeTooltip(
          d.placeName + " [" + d.id + "]",
          [
            {label:this.props.xValLabel.label, value:format(".2f")(d[this.props.xVal])},
            {label:"Amount Awarded", value:"£"+format(",.0f")(d['Amount Awarded'])}
          ]
        )
      })


      console.log(this.props);
      data = data.map(d => {
        return {
          'id': d['id'],
          [this.props.xVal]: d[this.props.xVal] ? (+d[this.props.xVal]) : 0,
          'Amount Awarded': d['Amount Awarded'] ? (+d['Amount Awarded']) : 0,
          'filterLocation': d.filterLocation,
          'placeName': d.placeName
        }
      });

      // console.log(data);
  
      var margin = {top: 20, right: 20, bottom: 90, left: 90},
      width = this.props.dimensions.width - margin.left - margin.right,
      height = this.props.dimensions.height - margin.top - margin.bottom,
      node = select(this.node);
  
      const xVal = this.props.xVal;
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
      .attr("stroke-width", 1)
      .attr("cx", d => x(+d[xVal]))
      .attr("cy", d => {
        return +d['Amount Awarded'] > yMin ? y(+d['Amount Awarded']) : yMin;
      })
      .attr('fill', d => d['filterLocation'] ? convertHex(colorScale(+d[xVal]),opacity) : "rgba(0,0,0,0)")
      .on('mouseover', function(d) {
        tooltip.show(d,this);
        select(this)
          .attr("r", 15)
          .attr("fill",convertHex(colorScale(+d[xVal]),opacity))
          .attr("stroke", "#f48320")
          .attr("stroke-width", 3);
      })
      .on('mouseout', function(d) {
        tooltip.hide();
        select(this)
          .attr("r", 3.5)
          .attr("fill",d => d['filterLocation'] ? convertHex(colorScale(+d[xVal]),opacity) : "rgba(0,0,0,0)")
          .attr("stroke", '#999')
          .attr("stroke-width", 1);
      })
      .on('click', function(d) { 
        console.log(this.props);
        tooltip.hide();
        filterFunc({'location': [d['id']] },true);
      });

      // node.selectAll('g').on("click",function(d){ 
      //   console.log(d);
      //   filterFunc({}); 
      // })

    node.call(tooltip);



      // add the x Axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x).ticks(4).tickFormat( format(".3s") ));

    // add the y Axis
    g.append("g")
    .call(axisLeft(y)
      .ticks(4)  
      .tickFormat(function(d) {return "£"+format(".3s")(d)
        .replace('M', ' mil')
        .replace('G', ' bil')
      }));

    }
    

    render() {
        return (
      <div className="DonorBarChart">
        <button onClick={this.props.addFilter.bind(this,{'location': 'reset'})}>Clear Scatterplot Filters</button>
        <svg ref={node => this.node = node}
          width={this.props.dimensions.width} height={this.props.dimensions.width}>
        </svg>
      </div>
      );
    }
}

DeprivationScatterPlot.propTypes = {}

DeprivationScatterPlot.defaultProps = {}

export default DeprivationScatterPlot
