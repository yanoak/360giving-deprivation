import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { getColorScale, convertHex, makeTooltip } from '../../VizHelpers'

import mapboxgl from 'mapbox-gl'
import './MapComponent.scss'
import { extent } from 'd3-array'


mapboxgl.accessToken = 'pk.eyJ1IjoieWFubmF1bmdvYWsiLCJhIjoiY2prdWVzemFqMGZ6dzNzbnc0Z3N0enBiMiJ9.TFt7qYDiE1k5bBt7NdFCrQ';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: 90,
      mainLayerId: 'admin-level-boundaries'
    }
  }

  setStateForMe = (state) => this.setState(state);

  // Create a popup, but don't add it to the map yet.
  markerHeight = 5; 
  markerRadius = 5; 
  linearOffset = 25;
  popupOffsets = {
  'top': [0, 0],
  'top-left': [0,0],
  'top-right': [0,0],
  'bottom': [0, -this.markerHeight],
  'bottom-left': [this.linearOffset, (this.markerHeight - this.markerRadius + this.linearOffset) * -1],
  'bottom-right': [-this.linearOffset, (this.markerHeight - this.markerRadius + this.linearOffset) * -1],
  'left': [this.markerRadius, (this.markerHeight - this.markerRadius) * -1],
  'right': [-this.markerRadius, (this.markerHeight - this.markerRadius) * -1]
  };

  popup = new mapboxgl.Popup({
    closeButton: false,
    offset: this.popupOffsets
  });

  componentDidMount() {
    const { opacity,mainLayerId,mainSourceId } = this.state;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: this.props.mapFormatting.position,
      zoom: this.props.mapFormatting.zoom
    });

    let myMap = this.map;

    

    myMap.on('load', () => {
      const {mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName,allMapSources} = this.props;
      const expression = this.buildDataLayer(mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName, opacity);
      
      allMapSources.forEach(d => this.addSource(d.sourceName,d.filePath));
      this.addDataLayer(expression,mapData);
      this.setUpMouseOver(mainLayerId,mapData,mapGeoPlaceName,this.popup);
      
      

    });

  }

  setUpMouseOver(mainLayerId,mapData,mapGeoPlaceName,popup) {
    let hoveredStateId =  null;

    let myMap = this.map;

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    myMap.on("mousemove", mainLayerId, function(e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
            myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: false});
          }
          // hoveredStateId = e.features[0].properties[mapGeoId];
          hoveredStateId = e.features[0].id;
          console.log({source: mapData, id: hoveredStateId});
          myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: true});

          // Display a popup with the name of the location
          console.log(e.lngLat);
          popup.setLngLat(e.lngLat)
            .setHTML(makeTooltip(e.features[0].properties[mapGeoPlaceName]))
            .addTo(myMap);

        }
      });
    
    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    myMap.on("mouseleave", mainLayerId, function() {
      if (hoveredStateId) {
        myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: false});
      }
      hoveredStateId =  null;
      popup.remove();
    });
  }

  buildDataLayer(mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName, opacity) {

    const xValues = scatterPlotData.map(d => +d[xVal]);
    const yValues = scatterPlotData.map(d => +d['Amount Awarded']);
        
    const colorScale = getColorScale(extent(xValues));

    let expression = ["match", ["get", mapGeoId]];

    scatterPlotData.forEach(function(row) {
      const color = row["filterLocation"] 
        ? convertHex(colorScale(+row[xVal]),opacity) 
        : "rgba(0,0,0,0)" ;
      expression.push(row["id"], color);
    });

    expression.push("rgba(0,0,0,0)");
    return expression;
  }

  addSource(sourceName,filePath) {
    this.map.addSource(sourceName, {
      type: 'geojson',
      data: filePath,
      generateId: true
    });
  }

  addDataLayer(expression,sourceName) {
    this.map.addLayer({
      id: this.state.mainLayerId,
      type: 'fill',
      source: sourceName,
      "paint": {
        "fill-color": expression,
        "fill-outline-color": "rgba(0,0,0,0.1)"
      }
    }, 'place-city-sm');

    this.map.addLayer({
      id: (this.state.mainLayerId+'_highlight'),
      type: 'line',
      source: sourceName,
      "paint": {
        "line-color": ["case",
          ["boolean", ["feature-state", "hover"], false],
            "#f48320",
            "rgba(0,0,0,0.1)"
          ],
          "line-width": ["case",
          ["boolean", ["feature-state", "hover"], false],
            2,
            0
          ]
        }
      });
  }

  removeDataLayer() {
    this.map.removeLayer(this.state.mainLayerId);
    this.map.removeLayer(this.state.mainLayerId+'_highlight');
  }
  
  
  componentWillUnmount() {
    this.map.remove();
  }


  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    console.log(this.map);
    
    if (nextProps.mapData !== this.props.mapData ||
      nextProps.scatterPlotData !== this.props.scatterPlotData ||
      nextProps.xVal !== this.props.xVal) 
    {
      const {mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName} = nextProps;
      const { opacity } = this.state;

      const waiting = () => {
        if (!this.map.isStyleLoaded() || !this.map.getLayer(this.state.mainLayerId)) {
          setTimeout(waiting, 200);
        } else {
          console.log(this.map.getLayer(this.state.mainLayerId));
          this.removeDataLayer();

          const expression = this.buildDataLayer(mapData, scatterPlotData, 
            xVal, mapGeoId, mapGeoPlaceName, opacity);
          this.addDataLayer(expression,mapData);
          this.setUpMouseOver(this.state.mainLayerId,mapData,mapGeoPlaceName,this.popup);
        }
      }
      waiting();
    } else console.log('Still loading data');
  }
  
  // setFill() {
  //   const { property, stops } = this.state.active;
  //   this.myMap.setPaintProperty('countries', 'fill-color', {
  //     property,
  //     stops
  //   });    
  // }

  render() {
    const style  ={
      position: 'relative',
      // top: 0,
      width: '400px',
      height: '500px'
    };


    // return <div className="MapComponent" style={style} ref={el => this.mapContainer = el} />;

    return <div className="MapComponent" >
      <div style={style} ref={el => this.mapContainer = el} className="absolute top right left bottom MapComponentMap" />
    </div>
  }

    
}

MapComponent.propTypes = {}

MapComponent.defaultProps = {}

export default MapComponent
