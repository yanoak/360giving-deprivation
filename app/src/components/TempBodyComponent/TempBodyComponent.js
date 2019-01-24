import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import PropTypes from 'prop-types'
// import 'mapbox-gl/dist/mapbox-gl.css';
// import './TempBodyComponent.scss'
import DonorBarChart from '../DonorBarChart/DonorBarChart'
import DeprivationScatterPlot from '../DeprivationScatterPlot/DeprivationScatterPlot';

import data from '../../data/combined_deprivation_ward.json' 
import donor_data from '../../data/grants_by_lad_ward_region_donor_year.json'
import scatter_data from '../../data/grants_by_lad_deprivation.json'

// class TempBodyComponent extends Component {
//     constructor(props) {
//         super(props)
//     }
    
//     render() {
//         return (
//             <div className="TempBodyComponent"></div>
//         );
//     }
// }

// TempBodyComponent.propTypes = {}

// TempBodyComponent.defaultProps = {}

mapboxgl.accessToken = 'pk.eyJ1IjoieWFubmF1bmdvYWsiLCJhIjoiY2prdWVzemFqMGZ6dzNzbnc0Z3N0enBiMiJ9.TFt7qYDiE1k5bBt7NdFCrQ';

const options = [{
  name: 'IMD',
  description: 'Index of Multiple Deprivation Score',
  property: 'IMD_avg_score',
  stops: [
    [0, '#f8d5cc'],
    [5, '#f4bfb6'],
    [10, '#f1a8a5'],
    [15, '#ee8f9a'],
    [20, '#ec739b'],
    [25, '#dd5ca8'],
    [30, '#c44cc0'],
    [35, '#9f43d7'],
    [40, '#6e40e6']
  ]
}, {
  name: 'Health',
  description: 'Index of Health Deprivation Score',
  property: 'Health_avg_score',
  stops: [
    [-2.5, '#f8d5cc'],
    [-2, '#f4bfb6'],
    [-1.5, '#f1a8a5'],
    [-1, '#ee8f9a'],
    [-0.5, '#ec739b'],
    [0, '#dd5ca8'],
    [0.5, '#c44cc0'],
    [1, '#9f43d7'],
    [1.5, '#6e40e6']
  ]
}]

class TempBodyComponent extends React.Component {
  map;

  constructor(props) {
    super(props);
    this.state = {
      active: options[0],
      dataByDonor: [],
      scatterData: []
    };
  }

  componentDidUpdate() {
    // this.setFill();
    const waiting = () => {
      if (!this.map.isStyleLoaded()) {
        setTimeout(waiting, 200);
      } else {
        this.setFill();
      }
    };
    waiting();
  }

  componentWillMount() {
    console.log(scatter_data);
    // const data = nestDonorData(this.state.dataByDonor);
    this.setState({
      dataByDonor: this.props.smallMultiplesData,
      scatterData: scatter_data
      // scatterData: this.props.scatterPlotData
    });
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      // container: this.map,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [6, 52.561928],
      zoom: 5,
      width: '400px'
    });

    this.map.on('load', () => {
      console.log(data);
      this.map.addSource('countries', {
        type: 'geojson',
        data
      });

      this.map.addLayer({
        id: 'countries',
        type: 'fill',
        source: 'countries'})
      // }, 'LSOA2011_CD'); // ID metches `mapbox/streets-v9`
      // }, 'country-label-lg'); // ID metches `mapbox/streets-v9`

      this.setFill();
    });

    // this.map.on('style.load', () => {

    //   // const waiting = () => {
    //   //   if (!this.map.isStyleLoaded()) {
    //   //     setTimeout(waiting, 200);
    //   //   } else {
    //       this.map.addLayer({
    //         id: 'countries',
    //         type: 'fill',
    //         source: 'countries'})
    //       // }, 'LSOA2011_CD'); // ID metches `mapbox/streets-v9`
    //       // }, 'country-label-lg'); // ID metches `mapbox/streets-v9`
    
    //       this.setFill();
    //   //   }
    //   // };
    //   // waiting();
      
    // });

    console.log(this.map);
  }

  setFill() {
    const { property, stops } = this.state.active;
    this.map.setPaintProperty('countries', 'fill-color', {
      property,
      stops
    });    
  }

  render() {
    const { name, description, stops, property } = this.state.active;
    const renderLegendKeys = (stop, i) => {
      return (
        <div key={i} className='txt-s'>
          <span className='mr6 round-full w12 h12 inline-block align-middle' style={{ backgroundColor: stop[1] }} />
          <span>{`${stop[0].toLocaleString()}`}</span>
        </div>
      );
    }

    const renderOptions = (option, i) => {
      return (
        <label key={i} className="toggle-container">
          <input onChange={() => this.setState({ active: options[i] })} checked={option.property === property} name="toggle" type="radio" />
          <div className="toggle txt-s py3 toggle--active-white">{option.name}</div>
        </label>
      );
    }

    return (
      <div>
        <div>
          <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
          {/* <div ref={el => this.mapContainer = el} className="absolute top right left bottom" /> */}
          <div className="toggle-group absolute top left ml12 mt12 border border--2 border--white bg-white shadow-darken10 z1">
            {options.map(renderOptions)}
          </div>
          <div className="bg-white absolute bottom left mr12 mb24 py12 px12 shadow-darken10 round z1 wmax180">
            <div className='mb6'>
              <h2 className="txt-bold txt-s block">{name}</h2>
              <p className='txt-s color-gray'>{description}</p>
            </div>
            {stops.map(renderLegendKeys)}
          </div>
          <div id='charts' className="bg-white absolute top right mr12 mb24 py12 px12 shadow-darken10 round z1 wmax180 chartsBox">
            
            <div className='scatterplotView'>
              <DeprivationScatterPlot
                data={this.state.scatterData}
                // xVal='IMD_avg_score'
                xVal={this.props.scatterPlotXVal}
              />
            </div>
            <div className='smallmultiplesView'>
              {this.state.dataByDonor.map(d => <div>
                {d.key}<br/>
                <DonorBarChart
                  data = {d}
                />
              </div>)}
              
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TempBodyComponent
