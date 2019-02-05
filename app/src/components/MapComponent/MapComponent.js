import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { getColorScale, convertHex, makeTooltip, getExtent } from '../../VizHelpers'
import { format } from 'd3-format'
import { legendColor } from 'd3-svg-legend'
import { select } from 'd3-selection'
import mapboxgl from 'mapbox-gl'
import './MapComponent.scss'
import { extent } from 'd3-array'


mapboxgl.accessToken = 'pk.eyJ1IjoieWFubmF1bmdvYWsiLCJhIjoiY2prdWVzemFqMGZ6dzNzbnc0Z3N0enBiMiJ9.TFt7qYDiE1k5bBt7NdFCrQ';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: 90,
      mainLayerId: 'admin-level-boundaries',
      geoId: ''
    }
  }

  setStateForMe = (state) => this.setState(state);
  callBackFuncClick = () => null;
  callBackFuncMMove = () => null;
  callBackFuncMLeave = () => null;

  popup = new mapboxgl.Popup({
    closeButton: false,
    anchor: 'left',
    offset: [10,0]
  });

  componentDidMount() {
    const { opacity,mainLayerId } = this.state;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: this.props.mapFormatting.position,
      zoom: this.props.mapFormatting.zoom
    });

    let myMap = this.map;

    

    myMap.on('load', () => {
      const {mapData, scatterPlotData, xVal, xValLabel, yMinLimit, mapGeoId, mapGeoPlaceName,allMapSources,addFilter} = this.props;
      const expression = this.buildDataLayer(mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName, opacity, yMinLimit);
      
      allMapSources.forEach(d => this.addSource(d.sourceName,d.filePath));
      this.addDataLayer(expression,mapData);
      this.setUpMouseOver(mainLayerId,mapData,mapGeoPlaceName,mapGeoId,this.popup,
        scatterPlotData,xVal,xValLabel);
      console.log("calling setuponlick from componentDidMount");
      this.setUpOnClick(mainLayerId,mapGeoId,addFilter);
      

    });

  }

  setUpOnClick(mainLayerId,mapGeoId,filterFunc) {
    let myMap = this.map;

    myMap.off('click', mainLayerId, this.callBackFuncClick);

    this.callBackFuncClick = (e) => {
      const placeCode = e.features[0].properties[mapGeoId];
      filterFunc({'location': [placeCode] },true);
    }

    myMap.on('click', mainLayerId, this.callBackFuncClick);
  }

  setUpMouseOver(mainLayerId,mapData,mapGeoPlaceName,mapGeoId,
    popup,scatterPlotData,xVal,xValLabel) {
    let hoveredStateId =  null;

    let myMap = this.map;
    console.log(mapGeoId);
    myMap.off("mousemove", mainLayerId, this.callBackFuncMMove);
    myMap.off("mouseleave", mainLayerId, this.callBackFuncMLeave);


    this.callBackFuncMMove = (e) =>  {
      console.log(mapGeoId);

      if (e.features.length > 0) {
        if (hoveredStateId) {
          myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: false});
        }
        hoveredStateId = e.features[0].id;
        myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: true});

        const placeName = e.features[0].properties[mapGeoPlaceName];
        const placeCode = e.features[0].properties[mapGeoId];
        const tooltipTitle = placeName + " [" + placeCode + "]";
        const scatterDataPoint = scatterPlotData.filter(d => d.id === placeCode);
        const tooltipVars = scatterDataPoint.length > 0 
        ? [
            {label:xValLabel.label, value:format(".2f")(scatterDataPoint[0][xVal])},
            {label:"Amount Awarded", value:"£"+format(",.0f")(scatterDataPoint[0]['Amount Awarded'])}
          ]
        : [];

        // Display a popup with the name of the location
        popup.setLngLat(e.lngLat)
          .setHTML(makeTooltip(tooltipTitle,tooltipVars))
          .addTo(myMap);

        }
      }

      this.callBackFuncMLeave = () => {
        if (hoveredStateId) {
          myMap.setFeatureState({source: mapData, id: hoveredStateId}, { hover: false});
        }
        hoveredStateId =  null;
        popup.remove();
      }

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    myMap.on("mousemove", mainLayerId, this.callBackFuncMMove);
    
    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    myMap.on("mouseleave", mainLayerId, this.callBackFuncMLeave);

  }

  buildDataLayer(mapData, scatterPlotData, xVal, mapGeoId, mapGeoPlaceName, opacity, yMinLimit) {

    const yLabel = 'Amount Awarded'

    const xValues = scatterPlotData.map(d => +d[xVal]);
    const yValues = scatterPlotData.map(d => +d[yLabel]);
        
    const colorScale = getColorScale(getExtent(xValues));
    let [yMin, yMax] = getExtent(yValues,yMinLimit,true);

    let expression = ["match", ["get", mapGeoId]];
    console.log([yMin, yMax]);

    scatterPlotData.forEach(function(row) {
      // console.log(yMin,+row[yLabel],row["filterLocation"])
      const color = (row["filterLocation"] && +row[yLabel] >= yMin)
        ? convertHex(colorScale(+row[xVal]),opacity) 
        : "rgba(0,0,0,0)" ;
      expression.push(row["id"], color);
    });

    expression.push("rgba(0,0,0,0)");

    var svg = select("#legendContainer");
    svg.selectAll("g").remove();

    svg.append("g")
      .attr("class", "legendQuant");

    var legend = legendColor()
      .labelFormat(format(".3s"))
      // .useClass(true)
      .titleWidth(100)
      .scale(colorScale);

    svg.select(".legendQuant")
      .call(legend);


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
      nextProps.mapGeoId !== this.props.mapGeoId ||
      nextProps.scatterPlotData !== this.props.scatterPlotData ||
      nextProps.xVal !== this.props.xVal) 
    {
      const {mapData, scatterPlotData, xVal, xValLabel, yMinLimit, mapGeoId, mapGeoPlaceName, addFilter} = nextProps;
      const { opacity } = this.state;

      const waiting = () => {
        if (!this.map.isStyleLoaded() || !this.map.getLayer(this.state.mainLayerId)) {
          setTimeout(waiting, 200);
        } else {
          console.log(this.map.getLayer(this.state.mainLayerId));
          this.removeDataLayer();

          const expression = this.buildDataLayer(mapData, scatterPlotData, 
            xVal, mapGeoId, mapGeoPlaceName, opacity, yMinLimit);
          this.addDataLayer(expression,mapData);
          this.setUpMouseOver(this.state.mainLayerId,mapData,mapGeoPlaceName,
            mapGeoId,this.popup,scatterPlotData,xVal,xValLabel);
          // console.log("calling setuponlick from componentWillReceiveProps");
          this.setUpOnClick(this.state.mainLayerId,mapGeoId,addFilter);

        }
      }
      waiting();
    } else console.log('Still loading data');
  }
  

  render() {
    const style  ={
      position: 'relative',
      // top: 0,
      width: this.props.dimensions.width,
      height: this.props.dimensions.width
    };

    
    return <div className="MapComponent" >
      <div style={style} ref={el => this.mapContainer = el} className="absolute top right left bottom MapComponentMap">
      <div className='map-overlay top'>
        <div className='map-overlay-inner'>
          <svg id="legendContainer">

          </svg>
        </div>
      </div>
      </div>
      
    </div>
  }

    
}

MapComponent.propTypes = {}

MapComponent.defaultProps = {}

export default MapComponent
