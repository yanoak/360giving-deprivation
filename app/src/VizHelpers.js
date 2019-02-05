
import {scaleQuantile} from 'd3-scale';
import {extent} from 'd3-array';
import _ from 'lodash';

export const getColorScale = (d) => {
  console.log(d);
  return scaleQuantile()
    .domain(_.range(d[0], d[1], (d[1]-d[0])/10))
    // .domain([0,5,10,15,20,25,30,35,40])
    .range(['#f8d5cc','#f4bfb6','#f1a8a5','#ee8f9a','#ec739b','#dd5ca8','#c44cc0','#9f43d7','#6e40e6']);
}

export const convertHex = (hex,opacity) => {
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);

  const result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
  return result;
}

export const makeTooltip = (title,items) => {
  let htmlBlock = "<div class='tootltip' style='font-size:12px; border: 1px solid #ccc; background-color: rgba(255,255,255,0.9); padding:5px; max-width:150px; z-index:2000'>"
  htmlBlock += title ? "<div style='font-size:20px'>" + title + "</div>" : '';
  if (items)
    items.forEach(i => {
      htmlBlock += ("<br/><strong>"+i.label+":</strong> ")
      htmlBlock += ("<br/><div class='tootltip-value' style='font-size:18px;'>"+i.value+"</div>")
    })
  htmlBlock += '</div>';
  return htmlBlock;
}

export const getPowersOf10 = (minVal,maxVal) => {
  console.log(minVal,maxVal);
  let currentPow = 0;
  let returnVals = [];
  while (Math.pow(10,currentPow) <= maxVal) {
    if (Math.pow(10,currentPow) >= minVal) 
      returnVals.push(Math.pow(10,currentPow));
    currentPow++;
  }
  return returnVals;
}

export const getExtent = (yValues,yMinLimit,allPos,paddingPercent) => {
  let [yMin,yMax] = extent(yValues);
  yMinLimit = yMinLimit ? yMinLimit : 1;
  
  const padding = paddingPercent ? (yMax-yMin)*paddingPercent : (yMax-yMin)*0.1
  yMin = yMin-padding;
  yMax = yMax+padding;
  
  if (yMinLimit) {
    yMin = yMin > yMinLimit ? yMin : yMinLimit;
    yMax = yMax > 0 ? yMax : yMin;
  }
  if (allPos) {
    yMin = yMin > 0 ? yMin : 1;
    yMax = yMax > 0 ? yMax : 1;
  }
  console.log([yMin,yMax]);
  return [yMin,yMax]
} 