import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { extent } from 'd3-array'
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

  // test
  // filters = {'location': ['E09000028','E09000001'], 'years': [2013,2016]};

  console.log("filters: ",filters);
  grant[selectedRegion][grants_defult_dataset_name].data.forEach(d => {
    // d.filterOn = Math.random() > 0.5 ? true : false;
    d.filterOn = true;
    d.filterLocation = true;
  })
  comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].data.forEach(d => {
    // d.filterOn = Math.random() > 0.5 ? true : false;
    d.filterOn = true;
    d.filterLocation = true;
  })

  // filter functions 
  if (filters) {
    // {grantFiltered: grantData, comparisonFiltered: comparisonData}
    let {grantFiltered, comparisonFiltered} = filterDiscrete(
      filters,
      grant[selectedRegion][grants_defult_dataset_name],
      comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]],
      selectedRegion, 
      selectedGeoLevel, 
      selectedComparison
    )

    grant[selectedRegion][grants_defult_dataset_name].data = grantFiltered;
    comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].data = comparisonFiltered;
  }

  console.log(grant);

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
  dataForMap = geo[selectedRegion][selectedGeoLevel].sourceName;
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

  // right hand side dataset (Y-Axis)
  const scatterRight = nest()
    .key(d => d[originalData.grant[selectedRegion][grants_defult_dataset_name].id[selectedGeoLevel]])
    .rollup(values => 
      ({
        filterOn: values.some(x => x.filterOn === true) === true,
        filterLocation: values.some(x => x.filterLocation === true) === true,
        [originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]: sum(values, d => {
          let returnVal = d.filterOn 
            ? +d[originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]
            : 0;
          // return d.filterOn 
          //   ? +d[originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]
          //   : 0;
          return returnVal;
        }) 
      })
    )
    .entries(originalData.grant[selectedRegion][grants_defult_dataset_name].data);

  console.log(scatterRight);

  // left hand side dataset (X-Axis) 
  const scatterLeft = nest()
    .key(d => d[originalData.comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].id])
    .entries(originalData.comparison[selectedRegion][selectedGeoLevel][selectedComparison[0]].data);

  // merge left hand side dataset and right hand side dataset
  const mergedLeftRight = mergeById(scatterLeft,scatterRight,'key','key',
    [selectedComparison[1]],
    [originalData.grant[selectedRegion][grants_defult_dataset_name].dataField]
  );

  // Get place names
  return mergedLeftRight.map(d => {
    const placeName = originalData.geo[selectedRegion][selectedGeoLevel].lookUp[d.id]
      ? originalData.geo[selectedRegion][selectedGeoLevel].lookUp[d.id].value
      : '';
    return {...d, placeName: placeName};
  });
}

export const prepSmallMultiplesData = (originalData, selectedRegion) => {
  
  const data = originalData.grant[selectedRegion][grants_defult_dataset_name].data;

  var nested_data = nest()
  .key(function(d) { return d['Funding Org:Name']; })
  .key(function(d) { return d['Award Year']; })
  .rollup(function(leaves) { 
    return {
      "projects": sum(leaves, d => (d['filterOn'] && d['filterLocation']) ? d['Identifier'] : 0), 
      "total_awarded": sum(leaves, d => (d['filterOn'] && d['filterLocation']) ? d['Amount Awarded'] : 0)
    } 
  })
  .entries(data);

  // console.log(nested_data);
  return nested_data.filter(d => d.values.filter(y => y.value["total_awarded"]>0).length > 0);
}

// Filterable dimensions:
// - location
// - time
export const filterDiscrete = (filters,grant,comparison,
  selectedRegion,selectedGeoLevel,selectedComparison) => {
  const filterKeys = Object.keys(filters);


  let grantData = grant.data;
  let comparisonData = comparison.data;

  console.log(filterKeys,filters,grantData,comparisonData);
  console.log("location" in filterKeys);

  if (filterKeys.includes('location') && filters['location'] !== 'reset') {
    const grantLocationKey = grant.id[selectedGeoLevel];
    grantData.forEach(d => {
      d.filterLocation = (filters['location'].includes(d[grantLocationKey])) ? true : false;
    })
  }

  if (filterKeys.includes('years') && filters['years'] !== 'reset') {
    const yearsRange = _.range(extent(filters['years'])[0],extent(filters['years'])[1]);
    // console.log(extent(filters['years']));
    grantData.forEach(d => {
      d.filterOn = (yearsRange.includes(+d['Award Year'])) ? true : false;
    })
  }

  return {grantFiltered: grantData, comparisonFiltered: comparisonData}
}

export const filterContinuous = () => {

}

export const mergeById = (mainTable, lookupTable, 
  mainKey, lookupKey, keepVarsMain, keepVarsLookup) => {

  const select = (mainItem, lookUpItem) => {

    let mainKeep, mainValueLocation, lookUpValueLocation, lookUpKeep, filterOn, filterLocation;
    mainKeep = mainValueLocation = lookUpValueLocation = lookUpKeep = filterOn = filterLocation = null;
    
    if(mainItem) {
      mainValueLocation = mainItem.value ? mainItem.value : mainItem.values[0];
      mainKeep = _.pick(mainValueLocation, keepVarsMain);
    }

    if(lookUpItem) {
      lookUpValueLocation = lookUpItem.value ? lookUpItem.value : lookUpItem.values[0];
      lookUpKeep = _.pick(lookUpValueLocation, keepVarsLookup);
    }

    if (mainItem && lookUpItem) {
      filterOn = mainValueLocation.filterOn && lookUpValueLocation.filterOn;
      filterLocation = mainValueLocation.filterLocation && lookUpValueLocation.filterLocation;
    }
    else if (mainItem) {
      filterOn = mainValueLocation.filterOn;
      filterLocation = mainValueLocation.filterLocation;
    }
    else if (lookUpItem) {
      filterOn = lookUpValueLocation.filterOn;
      filterLocation = lookUpValueLocation.filterLocation;
    }

    return {
      id: mainItem.key,
      ...mainKeep,
      ...lookUpKeep,
      filterOn: filterOn,
      filterLocation: filterLocation
    };
  }

  console.log(mainTable,lookupTable);

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