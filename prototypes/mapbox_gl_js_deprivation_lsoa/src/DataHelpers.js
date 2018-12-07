import {nest} from 'd3-collection';
import {sum, range} from 'd3-array';
import {scaleQuantile} from 'd3-scale';

export const nestDonorData = (d) => {
  var nested_data = nest()
    .key(function(d) { return d['Funding Org:Name']; })
    .key(function(d) { return d['Award Year']; })
    .rollup(function(leaves) { 
      return {
        "projects": sum(leaves, d => d['Identifier']), 
        "total_awarded": sum(leaves, d => d['Amount Awarded'])
      } 
    })
    .entries(d);
  return nested_data;
}

export const getColorScale = (d) => {
  console.log(d);
  return scaleQuantile()
    // .domain(range(d[0], d[1], (d[1]-d[0])/10))
    .domain([0,5,10,15,20,25,30,35,40])
    .range(['#f8d5cc','#f4bfb6','#f1a8a5','#ee8f9a','#ec739b','#dd5ca8','#c44cc0','#9f43d7','#6e40e6']);
}
