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

// import geo_eng_LAD from './data/geo/geo_eng_LAD.json';
// import geo_eng_ward from './data/geo/geo_eng_ward.json';

// import grants_eng_LAD_ward_donor_year from './data/grants/grants_eng_LAD_ward_donor_year.csv';

// import comparison_eng_LAD_deprivation from './data/comparison/comparison_eng_LAD_deprivation.csv';
// import comparison_eng_ward_deprivation from './data/comparison/comparison_eng_ward_deprivation.csv';
// import comparison_eng_LAD_charities from './data/comparison/comparison_eng_LAD_charities.csv';
// import comparison_eng_ward_charities from './data/comparison/comparison_eng_ward_charities.csv';
// import comparison_eng_LAD_population from './data/comparison/comparison_eng_LAD_population.csv';
// import comparison_eng_ward_population from './data/comparison/comparison_eng_ward_population.csv';



export const loadAllData = () => {

  const { urlToKey, getWorkbook, getSheet } = sheetsy;


  const files = [
    { name: 'geo_eng_LAD', id: 'LAD2011_CD', placeName: 'lad11nm', data: 'geo_eng_LAD', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/geo/geo_eng_LAD.json'},
    { name: 'geo_eng_ward', id: 'wd17cd', placeName: 'wd17nm', data: 'geo_eng_ward', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/geo/geo_eng_ward.json'},
    {  
      name: 'grants_eng_LAD_ward_donor_year', 
      data: 'grants_eng_LAD_ward_donor_year',
      id: {
        'LAD': 'Recipient District Geographic Code',
        'ward': 'Recipient Ward Geographic Code'
      },
      dataField: 'Amount Awarded', 
      filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/grants/grants_eng_LAD_ward_donor_year.csv'
    },
    { name: 'comparison_eng_LAD_deprivation', id: 'LAD2013_CD', data: 'comparison_eng_LAD_deprivation', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_LAD_deprivation.csv'},
    { name: 'comparison_eng_ward_deprivation', id: 'WD17CD', data: 'comparison_eng_ward_deprivation', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_ward_deprivation.csv'},
    { name: 'comparison_eng_LAD_charities', id: 'lad11cd', data: 'comparison_eng_LAD_charities', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_LAD_charities.csv'},
    { name: 'comparison_eng_ward_charities', id: 'wd11cd', data: 'comparison_eng_ward_charities', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_ward_charities.csv'},
    { name: 'comparison_eng_LAD_population', id: 'lad11cd', data: 'comparison_eng_LAD_population', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_LAD_population.csv'},
    { name: 'comparison_eng_ward_population', id: 'Ward Code 1', data: 'comparison_eng_ward_population', filePath: 'https://raw.githubusercontent.com/yanoak/360giving-deprivation/master/app/src/data/comparison/comparison_eng_ward_population.csv'},
    { name: 'infoboxesGoogleSheet', filePath: 'https://docs.google.com/spreadsheets/d/1b94FIknCydzUCC1o5pceMGYgG2pjfowMTOfAbJs4l-Q/edit?usp=sharing'}
  ]

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
    }

    if (f.name === 'infoboxesGoogleSheet' ) {
      console.log(f.name);
      promises.push(
        getWorkbook(urlToKey(f.filePath))
        .then((workBook) => getSheet(
            urlToKey(f.filePath),
            workBook.sheets[0].id
          )
        )
      )
    }
  });


  return Promise.all(promises).then(function(values) {

    const result = {
      geo: {eng: {LAD: {}, ward: {}}}, 
      comparison: {eng: {LAD: {}, ward: {}}},
      grant: {eng: {}}, 
      abbreviations: abbreviations,
      regions: regions,
      geoLevels: geoLevels,
      allMapSources: []
    };

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
             'data': values[i],
             'filePath': files[i].filePath,
             'lookUp': _.keyBy(
                values[i].features
                  .map(f => ({'key': f.properties[files[i].id],'value': f.properties[files[i].placeName]}) ), 
               'key'
               )
            };
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
            'data': values[i]
          };
          break; 
         }
        
        case 'infoboxesGoogleSheet': { 
          result.infoBoxes = _.keyBy(values[i].rows.map(d=> ({id:d.id,content:d.content})), 'id');
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