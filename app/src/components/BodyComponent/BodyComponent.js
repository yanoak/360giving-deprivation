import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './BodyComponent.scss'
import { Grid, Row, Col } from 'react-flexbox-grid';
import DeprivationScatterPlot from '../DeprivationScatterPlot/DeprivationScatterPlot';
import DonorBarChart from '../DonorBarChart/DonorBarChart';
import MapComponent from '../MapComponent/MapComponent';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import MultiSelect from "@kenshooui/react-multi-select";
import { prepKeyValuePairs, locationLabelFunc, donorLabelFunc } from '../../Utils';
import 'rc-slider/assets/index.css';
import "@kenshooui/react-multi-select/dist/style.css"
import { selector } from 'd3-selection';
import ReactMarkdown from 'react-markdown';
import Popup from 'reactjs-popup';


const YearSlider = createSliderWithTooltip(Slider.Range);

const Card = ({content}) => (
  <div className="card">
    <div className="content">
      <ReactMarkdown source={content} />
    </div>
  </div>
)

class BodyComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      yearsRange: this.props.yearsRange ? this.props.yearsRange : [2013,2018],
      showSelectorLocations: false,
      showSelectorDonors: false,
      locationsList: [],
      donorsList: [],
    }
  }
  
  componentDidMount() { 
    this.setNewLocationsList(this.props.scatterPlotData);
    this.setNewDonorsList(this.props.smallMultiplesData);
	} 

  setNewLocationsList(newList) {
    this.setState({ 
      locationsList: newList 
        ? prepKeyValuePairs(newList,'id',locationLabelFunc,'filterLocation')
        : [{id: 'test', label: 'placeholder'}]
      })
  }

  setNewDonorsList(newList) {
    this.setState({ 
      donorsList: newList 
        ? prepKeyValuePairs(newList,'key',donorLabelFunc,'filterDonor')
        : [{id: 'test', label: 'placeholder'}]
      })
  }

  locationValueRenderer = (selected, options) => {
    if (selected.length === 0) return "Slect some locations...";
    if (selected.length === options.length) return "All locations selected";
    return `Selected ${selected.length} locations`;
  }

  donorValueRenderer = (selected, options) => {
    if (selected.length === 0) return "Slect some grant makers...";
    if (selected.length === options.length) return "All grant makers selected";
    return `Selected ${selected.length} grant makers`; 
  }

  toggleSelector = (selector) => {
    console.log('show selector ' + selector);
    if (selector === 'locations') this.setState({showSelectorLocations: !this.state.showSelectorLocations});
    if (selector === 'donors') this.setState({showSelectorDonors: !this.state.showSelectorDonors});
  }

  filterLocations = (selectedLocations) => {
    if (selectedLocations.length === this.state.locationsList.length)
      this.props.addFilter({'location': 'reset' },false);
    else
      this.props.addFilter({'location': selectedLocations.map(d => d.id) },false);
  }

  filterDonors = (selectedDonors) => {
    // console.log(selectedDonors)
    if (selectedDonors.length === this.state.donorsList.length)
      this.props.addFilter({'donor': 'reset' },false);
    else
      this.props.addFilter({'donor': selectedDonors.map(d => d.id) },false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scatterPlotData !== this.props.scatterPlotData) {
      this.setNewLocationsList(nextProps.scatterPlotData)
    }
    if (nextProps.smallMultiplesData !== this.props.smallMultiplesData) {
      this.setNewDonorsList(nextProps.smallMultiplesData)
    }
  }

  

  render() {
    // console.log(this.props);

    const mapAndScatterWidth = this.props.dimensions.width <= 800 
      ? this.props.dimensions.width *0.8
      : this.props.dimensions.width *0.45;

    return (
      <div className="BodyComponent">
        <Grid fluid>
          <Row className='filtersRow'>
            <Col xs className='col leftCol'>
            <button onClick={() => this.toggleSelector('locations')} className="filterButton">
              {this.state.showSelectorLocations 
                ? <span>Close location selector</span> 
                : <span>Filter locations</span> 
              }
            </button>
            <button onClick={this.props.addFilter.bind(this,{'location': 'reset'})} className="filterButton">
              <span>Reset location filters</span>
            </button>
            <Popup
              trigger={<button className="button popUp"> i </button>}
              position="right center"
              on="click"
            >
              <Card content={this.props.infoBoxes['test'].content} />
            </Popup>
            {this.state.showSelectorLocations 
              ? <div className="multiSelector">
                <MultiSelect
                  items={this.state.locationsList}
                  selectedItems={this.state.locationsList.filter(d => d.filter)}
                  onChange={this.filterLocations}
                />
              </div>
              : null}
            </Col>
            <Col xs className='col rightCol'> 
              Filter years: 
              
              <YearSlider className='yearsSlider'
                allowCross={true}
                defaultValue={[this.state.yearsRange[0],this.state.yearsRange[1]+1]}
                min={2013}
                max={2019}
                // tipFormatter={formatter()}
                onAfterChange={(range) => this.props.addFilter({'years': range })}
                // onAfterChange={(range) => this.setState({yearsRange: range })}
                // tipProps={{ placement: 'top', prefixCls: 'rc-tooltip'}}
                dots={true}
                pushable={true}
                width={200}
                  />
            </Col>   
            <Col xs className='col'>
            <button onClick={() => this.toggleSelector('donors')} className="filterButton">
              {this.state.showSelectorDonors 
                ? <span>Close grant makers selector</span> 
                : <span>Filter grant makers</span> 
              }
            </button>
            <button onClick={this.props.addFilter.bind(this,{'donor': 'reset'})} className="filterButton">
              <span>Reset grant maker filters</span>
            </button>
            {this.state.showSelectorDonors 
              ? <div className="multiSelector">
                <MultiSelect
                  items={this.state.donorsList}
                  selectedItems={this.state.donorsList.filter(d => d.filter)}
                  onChange={this.filterDonors}
                />
              </div>
              : null}
            </Col>
          </Row>
          <Row>
            <Col xs className='col'> 
              {/* Hello uptown */}
              <MapComponent 
                mapFormatting={this.props.mapFormatting}
                scatterPlotData={this.props.scatterPlotData}
                mapData={this.props.mapData}
                allMapSources={this.props.allMapSources}
                xVal={this.props.scatterPlotXVal}
                xValLabel={this.props.scatterPlotXValLabel}
                yMinLimit={this.props.yMinLimit}
                mapGeoId={this.props.mapGeoId}
                mapGeoPlaceName={this.props.mapGeoPlaceName}
                dimensions={({width:mapAndScatterWidth,height:mapAndScatterWidth})}
                addFilter={this.props.addFilter.bind(this)}
              />
            </Col>
            <Col xs className='col'> 
              {/* Hello midtown */}
              <div className='scatterplotView'>
              <DeprivationScatterPlot
                data={this.props.scatterPlotData}
                xVal={this.props.scatterPlotXVal}
                xValLabel={this.props.scatterPlotXValLabel}
                yMinLimit={this.props.yMinLimit}
                dimensions={({width:mapAndScatterWidth,height:mapAndScatterWidth})}
                addFilter={this.props.addFilter.bind(this)}
              />
            </div>
            </Col>
            </Row>
            <Row>
              <Col xs className='col smallMultiplePlotsContainer'>
                <h3>Amounts awarded over time by individual granmakers in selected areas</h3>
              </Col>
            </Row>
            <Row>
              <Col xs className='col smallMultiplePlotsContainer'> 
                {/* Hello downtown  */}
                {this.props.smallMultiplesData
                  .filter(d => d.filterDonor && d.notZero)
                  .map((d,i) => <div className='smallMultiplePlot' key={'smallMultiPlePlot'+i}>
                  <div className='smallMultipleHeader'>{d.key}</div><br/>
                  <DonorBarChart
                    data = {d}
                  />
                </div>)}
              </Col>
          </Row>
        </Grid>
        {/* <MultiSelect
          options={this.state.locationsList}
          selected={[]}
          valueRenderer={this.locationValueRenderer}
          selectAllLabel="All locations"
        /> */}
        
      </div>
      
    );
  }
}

BodyComponent.propTypes = {}

BodyComponent.defaultProps = {}

export default BodyComponent
