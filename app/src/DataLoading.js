// import * as d3 from 'd3';
import { csv, json } from 'd3-fetch';
import sheetsy from 'sheetsy';


// import geo_eng_LAD from './data/geo/geo_eng_LAD.json';
// import geo_eng_ward from './data/geo/geo_eng_ward.json';

// import grants_eng_LAD_ward_donor_year from './data/grants/grants_eng_LAD_ward_donor_year.csv';

// import comparison_eng_LAD_deprivation from './data/comparison/comparison_eng_LAD_deprivation.csv';
// import comparison_eng_ward_deprivation from './data/comparison/comparison_eng_ward_deprivation.csv';
// import comparison_eng_LAD_charities from './data/comparison/comparison_eng_LAD_charities.csv';
// import comparison_eng_ward_charities from './data/comparison/comparison_eng_ward_charities.csv';
// import comparison_eng_LAD_population from './data/comparison/comparison_eng_LAD_population.csv';
// import comparison_eng_ward_population from './data/comparison/comparison_eng_ward_population.csv';


import _ from 'lodash';
import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';

// import geo_eng_LAD from './data/geo/geo_eng_LAD.json';
// import geo_eng_ward from './data/geo/geo_eng_ward.json';

// import grants_eng_LAD_ward_donor_year from './data/grants/grants_eng_LAD_ward_donor_year.csv';

// import comparison_eng_LAD_deprivation from './data/comparison/comparison_eng_LAD_deprivation.csv';
// import comparison_eng_ward_deprivation from './data/comparison/comparison_eng_ward_deprivation.csv';
// import comparison_eng_LAD_charities from './data/comparison/comparison_eng_LAD_charities.csv';
// import comparison_eng_ward_charities from './data/comparison/comparison_eng_ward_charities.csv';
// import comparison_eng_LAD_population from './data/comparison/comparison_eng_LAD_population.csv';
// import comparison_eng_ward_population from './data/comparison/comparison_eng_ward_population.csv';



export const loadAllData = (size,currentData) => {
  console.log("Loading Data for size " + size);

  const { urlToKey, getWorkbook, getSheet } = sheetsy;

  // { name: 'geo_eng_LAD', id: 'LAD2011_CD', placeName: 'lad11nm', data: 'geo_eng_LAD', year: '2011', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/geo/geo_eng_LAD_topo.json'},
  // { name: 'geo_eng_ward', id: 'wd17cd', placeName: 'wd17nm', data: 'geo_eng_ward', year: '2017', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/geo/geo_eng_ward_topo.json'},
    

  const filesSmall = [
    // { name: 'geo_eng_LAD', id: 'LAD2011_CD', placeName: 'lad11nm', data: 'geo_eng_LAD', year: '2011', type: 'geojson', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/geo/geo_eng_LAD.json'},
    { name: 'geo_eng_LAD', id: 'LAD2011_CD', placeName: 'lad11nm', data: 'geo_eng_LAD', year: '2011', type: 'vector', sourceLayer: 'geo_eng_LAD', filePath: 'mapbox://yannaungoak.0ge46srg', lookupFilePath: 'https://360-giving-grants-map.s3.eu-west-2.amazonaws.com/data/geo/geo_eng_LAD_lookup.json'},
    // { name: 'geo_eng_ward', id: 'wd17cd', placeName: 'wd17nm', data: 'geo_eng_ward', year: '2017', type: 'geojson', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/geo/geo_eng_ward.json'},
    { name: 'geo_eng_ward', id: 'wd17cd', placeName: 'wd17nm', data: 'geo_eng_ward', year: '2017', type: 'vector', sourceLayer: 'geo_eng_ward', filePath: 'mapbox://yannaungoak.c4hq3m9h', lookupFilePath: 'https://360-giving-grants-map.s3.eu-west-2.amazonaws.com/data/geo/geo_eng_ward_lookup.json'},
    {  
      name: 'grants_eng_LAD_ward_donor_year', 
      data: 'grants_eng_LAD_ward_donor_year',
      id: {
        'LAD': 'Recipient District Geographic Code',
        'ward': 'Recipient Ward Geographic Code'
      },
      dataField: 'Amount Awarded', 
      filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/grants/grants_eng_LAD_ward_donor_year.csv'
    },
    { name: 'comparison_eng_LAD_deprivation', id: 'LAD2013_CD', data: 'comparison_eng_LAD_deprivation', year: '2015', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_LAD_deprivation.csv'},
    { name: 'comparison_eng_ward_deprivation', id: 'WD17CD', data: 'comparison_eng_ward_deprivation', year: '2015', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_ward_deprivation.csv'},
    { name: 'comparison_eng_LAD_charities', id: 'lad11cd', data: 'comparison_eng_LAD_charities', year: '2018', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_LAD_charities.csv'},
    { name: 'comparison_eng_ward_charities', id: 'WD17CD', data: 'comparison_eng_ward_charities', year: '2018', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_ward_charities.csv'},
    { name: 'comparison_eng_LAD_population', id: 'lad11cd', data: 'comparison_eng_LAD_population', year: '2017', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_LAD_population.csv'},
    { name: 'comparison_eng_ward_population', id: 'Ward Code 1', data: 'comparison_eng_ward_population', year: '2017', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/comparison/comparison_eng_ward_population.csv'},
    // { name: 'infoboxesGoogleSheet', filePath: 'https://docs.google.com/spreadsheets/d/1b94FIknCydzUCC1o5pceMGYgG2pjfowMTOfAbJs4l-Q/edit?usp=sharing'}
    { name: 'infoboxesGoogleSheet', csvPath: 'https://docs.google.com/spreadsheets/d/1b94FIknCydzUCC1o5pceMGYgG2pjfowMTOfAbJs4l-Q/export?gid=0&format=csv', filePath: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQCz2QeRc4QGYCU7pdnsT2G1bL8PpUK9cdadRpw_e5gAD0ys-lS1w_P3EQkTr2HL6CfwGatd_8P86G5/pubhtml'}
  ]

  // const filesLarge = [
  //   { name: 'geo_eng_ward', id: 'wd17cd', placeName: 'wd17nm', data: 'geo_eng_ward', year: '2017', filePath: 'https://s3.eu-west-2.amazonaws.com/360-giving-grants-map/data/geo/geo_eng_ward.json'},
  // ]

  const files = filesSmall;

  const abbreviations = {
    geoLevel: {
      'LAD': 'Local Authority District',
      'ward': 'Ward'
    },
    region: {
      'eng': 'England',
      'sco': 'Scotland',
      'nir': 'Northern Ireland',
      'wal': 'Wales',
      'uk': 'United Kingdom'
    }
  }

  const regions = {
    eng: { value: 'eng', label: 'England', position: [-1.464854, 52.561928], zoom: 5 }
  }

  const geoLevels = {
    LAD: { value: 'LAD', label: 'Local Authority District'},
    ward: { value: 'ward', label: 'Ward'}
  }



  const promises = [];

  files.forEach((f) => {
    if (f.filePath.slice(-4) === '.csv') {
      promises.push( csv(f.filePath) );
    } else if (f.filePath.slice(-5) === '.json') {
      promises.push( json(f.filePath) );
    } else if (f.name === 'infoboxesGoogleSheet' ) {
      promises.push(
        csv(f.csvPath)
        // getWorkbook(urlToKey(f.filePath))
        // getWorkbook(urlToKey(f.filePath))
        // .then(workBook => {
        //   console.log(workBook);
        //   return getSheet(
        //     urlToKey(f.filePath),
        //     workBook.sheets[0].id
        //   )
        // })
      )
    } else {
      promises.push(json(f.lookupFilePath));
    }

    
  });


  return Promise.all(promises).then(function(values) {

    let result = {
      geo: {eng: {LAD: {}, ward: {}}}, 
      comparison: {eng: {LAD: {}, ward: {}}},
      grant: {eng: {}}, 
      abbreviations: abbreviations,
      regions: regions,
      geoLevels: geoLevels,
      allMapSources: []
    };

    if (currentData) result = currentData;


    console.log(result);
    console.log(values);

    for (let i = 0; i < files.length; i++) {
       const [category, country, geoLevel, ...otherParts] = files[i].name.split('_');
       const datasetName = category === 'grants' 
        ? [geoLevel, ...otherParts].join('_')
        : otherParts.join('_');

       switch (category) {
         case 'geo': { 
           result.geo[country][geoLevel] = {
             'sourceName': files[i].name,
             'id': files[i].id, 
             'placeName': files[i].placeName,
             'year': files[i].year,
             'type': files[i].type,
             'data': files[i].type === 'geojson' ? values[i] : [],
             'sourceLayer': files[i].type === 'geojson' ? '' : files[i].sourceLayer,
             'filePath': files[i].filePath,
             'lookUp': files[i].type === 'geojson' 
                ? _.keyBy(
                    values[i].features
                    // values[i].objects[files[i].name].geometries // this is for TopoJSON
                      .map(f => {
                        return({'key': f.properties[files[i].id],'value': f.properties[files[i].placeName]}) 
                      }), 
                  'key'
                )
                : values[i]
            };
            result.geoLevels[geoLevel].label = result.geoLevels[geoLevel].label + ' (' + files[i].year + ")"
           break; 
          }
        case 'grants': { 
          result.grant[country][datasetName] = {
            'id': files[i].id, 
            'data': values[i],
            'dataField': files[i].dataField
          };
          break; 
         }
        case 'comparison': { 
          result.comparison[country][geoLevel][datasetName] = {
            'id': files[i].id, 
            'year': files[i].year,
            'data': values[i]
          };
          break; 
         }
        
        case 'infoboxesGoogleSheet': { 
          result.infoBoxes = _.keyBy(values[i].map(d=> ({id:d.id,content:d.content})), 'id');
          break; 
         }
         default: break;
       }
    }
    _.forEach(result.geo, function(valueRegion, keyRegion) {
      _.forEach(valueRegion, function(valueLevel, keyLevel) {
        result.allMapSources.push(valueLevel)
      })
    });

    return result;
  });

}