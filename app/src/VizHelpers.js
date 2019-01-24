
import {scaleQuantile} from 'd3-scale';
import _ from 'lodash';

export const getColorScale = (d) => {
  console.log(d);
  return scaleQuantile()
    .domain(_.range(d[0], d[1], (d[1]-d[0])/10))
    // .domain([0,5,10,15,20,25,30,35,40])
    .range(['#f8d5cc','#f4bfb6','#f1a8a5','#ee8f9a','#ec739b','#dd5ca8','#c44cc0','#9f43d7','#6e40e6']);
}