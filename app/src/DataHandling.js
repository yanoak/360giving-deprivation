import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import _ from 'lodash';
import { capitalize } from './Utils';

const grants_defult_dataset_name = 'LAD_ward_donor_year';

export const prepAllData = (originalData, selectedRegion, 
  selectedGeoLevel, selectedComparison, filters) => {

  console.log(originalData);
  console.log(selectedRegion, selectedGeoLevel, selectedComparison);

  let {grant, comparison, geo, 
    dataForMap, dataForScatter, dataForSmallMultiples, 
    comparisonVars,
    ...untouchedVars} = originalData;

  console.log(untouchedVars);
  const allComparisonTypes = Object.keys(comparison[selectedRegion][selectedGeoLevel]);

  // filter functions 
  if (!filters) {
    console.log("lets do some filtering")

    // originalData.geo[selectedRegion][selectedGeoLevel].data.features.forEach(d => {
    //   d.properties.filterOn = true;
    // })
    grant[selectedRegion][grants_defult_dataset_name].data.forEach(d => {
      d.filterOn = true;
    })
    comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].data.forEach(d => {
      // d.filterOn = Math.random() > 0.5 ? true : false;
      d.filterOn = true;
    })

  } else {

  }


  comparisonVars = allComparisonTypes
    .map(c => {
      console.log(comparison[selectedRegion][selectedGeoLevel][c]);
      return comparison[selectedRegion][selectedGeoLevel][c].data.columns
        .filter(d => d.startsWith("comparison_"))
        .map(d => {
          return {
            value: [c, d], 
            label: capitalize((c + ' - ' + d.slice(11)).split('_').join(' '))}
        });
    })

  comparisonVars = _.flatten(comparisonVars);
  
  // [selectedComparison[0]]

  // prep filtered data for charts
  dataForMap = geo[selectedRegion][selectedGeoLevel].data;
  dataForScatter = prepScatterData(originalData, selectedRegion, 
    selectedGeoLevel, selectedComparison);
  dataForSmallMultiples = prepSmallMultiplesData(originalData, selectedRegion);

  // return object with data prepared for each chart
  return {
    grant, comparison, geo, 
    comparisonVars: comparisonVars,
    dataForMap: dataForMap, 
    dataForScatter: dataForScatter, 
    dataForSmallMultiples: dataForSmallMultiples,
    ...untouchedVars
  }
}

export const prepScatterData = (originalData, selectedRegion, 
  selectedGeoLevel, selectedComparison) => {

  console.log(originalData);

  const scatterRight = nest()
    .key(d => d[originalData.grant[selectedRegion][grants_defult_dataset_name].id[selectedGeoLevel]])
    .rollup(values => 
      ({
        filterOn: values.some(x => x.filterOn === true) === true,
        [originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]: sum(values, d => {
          return d.filterOn 
            ? +d[originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]
            : 0;
        }) 
      })
    )
    .entries(originalData.grant[selectedRegion][grants_defult_dataset_name].data);

  const scatterLeft = nest()
    .key(d => d[originalData.comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].id])
    .entries(originalData.comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].data);

  const mergedLeftRight = mergeById(scatterLeft,scatterRight,'key','key',
    // originalData.comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].id, 
    // originalData.grant[selectedRegion][grants_defult_dataset_name].id[selectedGeoLevel],
    [selectedComparison[1]],
    [originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]
  );

  return mergedLeftRight;
}

export const prepSmallMultiplesData = (originalData, selectedRegion) => {
  
  const data = originalData.grant[selectedRegion][grants_defult_dataset_name].data;

  var nested_data = nest()
  .key(function(d) { return d['Funding Org:Name']; })
  .key(function(d) { return d['Award Year']; })
  .rollup(function(leaves) { 
    return {
      "projects": sum(leaves, d => d['Identifier']), 
      "total_awarded": sum(leaves, d => d['Amount Awarded'])
    } 
  })
  .entries(data);
  
  return nested_data;
}

export const filterDiscrete = () => {

}

export const filterContinuous = () => {

}

export const mergeById = (mainTable, lookupTable, 
  mainKey, lookupKey, keepVarsMain, keepVarsLookup) => {

  const select = (mainItem, lookUpItem) => {

    let mainKeep, mainValueLocation, lookUpValueLocation, lookUpKeep, filterOn;
    mainKeep = mainValueLocation = lookUpValueLocation = lookUpKeep = filterOn = null;
    
    if(mainItem) {
      mainValueLocation = mainItem.value ? mainItem.value : mainItem.values[0];
      mainKeep = _.pick(mainValueLocation, keepVarsMain);
    }

    if(lookUpItem) {
      lookUpValueLocation = lookUpItem.value ? lookUpItem.value : lookUpItem.values[0];
      lookUpKeep = _.pick(lookUpValueLocation, keepVarsLookup);
    }

    if (mainItem && lookUpItem)
      filterOn = mainValueLocation.filterOn && lookUpValueLocation.filterOn;
    else if (mainItem) 
      filterOn = mainValueLocation.filterOn;
    else if (lookUpItem) 
      filterOn = lookUpValueLocation.filterOn;

    return {
      id: mainItem.key,
      ...mainKeep,
      ...lookUpKeep,
      filterOn: filterOn
    };
  }

  let l = lookupTable.length,
      m = mainTable.length,
      lookupIndex = [],
      output = [];
      
  for (let i = 0; i < l; i++) { // loop through l items
    let row = lookupTable[i];
    lookupIndex[row[lookupKey]] = row; // create an index for lookup table
  }
  for (let j = 0; j < m; j++) { // loop through m items
    let y = mainTable[j];
    let x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
    output.push(select(y, x)); // select only the columns you need
  }
  return output;

}