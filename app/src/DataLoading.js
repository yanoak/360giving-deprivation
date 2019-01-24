// import * as d3 from 'd3';
import { csv, json } from 'd3-fetch';

import geo_eng_LAD from './data/geo/geo_eng_LAD.json';
import geo_eng_ward from './data/geo/geo_eng_ward.json';

import grants_eng_LAD_ward_donor_year from './data/grants/grants_eng_LAD_ward_donor_year.csv';

import comparison_eng_LAD_deprivation from './data/comparison/comparison_eng_LAD_deprivation.csv';
import comparison_eng_ward_deprivation from './data/comparison/comparison_eng_ward_deprivation.csv';
import comparison_eng_LAD_charities from './data/comparison/comparison_eng_LAD_charities.csv';
import comparison_eng_ward_charities from './data/comparison/comparison_eng_ward_charities.csv';
import comparison_eng_LAD_population from './data/comparison/comparison_eng_LAD_population.csv';
import comparison_eng_ward_population from './data/comparison/comparison_eng_ward_population.csv';

export const loadAllData = () => {

  const files = [
    { name: 'geo_eng_LAD', id: 'LAD2011_CD', data: geo_eng_LAD},
    { name: 'geo_eng_ward', id: 'wd17cd', data: geo_eng_ward},
    {  
      name: 'grants_eng_LAD_ward_donor_year', 
      data: grants_eng_LAD_ward_donor_year,
      id: {
        'LAD': 'Recipient District Geographic Code',
        'ward': 'Recipient Ward Geographic Code'
      },
      dataField: 'Amount Awarded'
    },
    { name: 'comparison_eng_LAD_deprivation', id: 'LAD2013_CD', data: comparison_eng_LAD_deprivation},
    { name: 'comparison_eng_ward_deprivation', id: 'WD17CD', data: comparison_eng_ward_deprivation},
    { name: 'comparison_eng_LAD_charities', id: 'lad11cd', data: comparison_eng_LAD_charities},
    { name: 'comparison_eng_ward_charities', id: 'wd11cd', data: comparison_eng_ward_charities},
    { name: 'comparison_eng_LAD_population', id: 'lad11cd', data: comparison_eng_LAD_population},
    { name: 'comparison_eng_ward_population', id: 'Ward Code 1', data: comparison_eng_ward_population},
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
    eng: { value: 'eng', label: 'England', position: [52.561928, -1.464854] }
  }

  const geoLevels = {
    LAD: { value: 'LAD', label: 'Local Authority District'},
    ward: { value: 'ward', label: 'Ward'}
  }

  const promises = [];

  files.forEach((f) => {
    if (typeof(f.data) !== 'string') {
      promises.push( f.data );
    } else if (f.data.slice(-4) === '.csv') {
      promises.push( csv(f.data) );
    } else if (f.data.slice(-5) === '.json') {
      promises.push( json(f.data) );
    }
  });

  return Promise.all(promises).then(function(values) {

    const result = {
      geo: {eng: {LAD: {}, ward: {}}}, 
      comparison: {eng: {LAD: {}, ward: {}}},
      grant: {eng: {}}, 
      abbreviations: abbreviations,
      regions: regions,
      geoLevels: geoLevels
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
             'id': files[i].id, 
             'data': values[i]
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
         default: break;
       }
    }

    // values
    // .filter(d => d.name === 'comparison_eng_LAD_deprivation')[0].data

    // result.comparison.eng_LAD_deprivation = dsv(
    //   comparison_eng_LAD_deprivation, data => {
    //     //whole data set
    //     // draw chart here
    //     console.log(data);
    //     return data;
    //   })
    

    return result;
  });

}