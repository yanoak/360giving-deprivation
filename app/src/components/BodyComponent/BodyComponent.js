import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './BodyComponent.scss'
import { Grid, Row, Col } from 'react-flexbox-grid';
import DeprivationScatterPlot from '../DeprivationScatterPlot/DeprivationScatterPlot';
import DonorBarChart from '../DonorBarChart/DonorBarChart';
import MapComponent from '../MapComponent/MapComponent';
import Slider, { createSliderWithTooltip } from 'rc-slider'

import 'rc-slider/assets/index.css';

const YearSlider = createSliderWithTooltip(Slider.Range);

class BodyComponent extends Component {
  constructor(props) {
    super(props)

  }

  state = {
    yearsRange: this.props.yearsRange ? this.props.yearsRange : [2013,2018]
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log(nextProps);
  //   if (nextProps.yearsRange) 
  //   {
  //     this.setState({
  //       yearsRange: this.props.yearsRange
  //     })  
  //   } else console.log('Still loading data');
  // }
    

  render() {
    console.log(this.props);
    console.log(this.props.yearsRange);

    return (
      <div className="BodyComponent">
        <Grid fluid>
          <Row className='filtersRow'>
            <Col xs className='col right-col'> 
              Years filter: 
              {/* {this.props.yearsRange[0] === this.props.yearsRange[1]
                ? this.props.yearsRange[0]
                : this.props.yearsRange[0]+ ' to ' +this.props.yearsRange[1]
              } */}
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
          </Row>
          <Row>
            <Col xs className='col left-col'> 
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
              />
            </Col>
            <Col xs className='col center-col'> 
              {/* Hello midtown */}
              <div className='scatterplotView'>
              <DeprivationScatterPlot
                data={this.props.scatterPlotData}
                // xVal='IMD_avg_score'
                xVal={this.props.scatterPlotXVal}
                xValLabel={this.props.scatterPlotXValLabel}
                yMinLimit={this.props.yMinLimit}
                dimensions={({width:400,height:400})}
                addFilter={this.props.addFilter.bind(this)}
              />
            </div>
            </Col>
            <Col xs className='col right-col'> 
              {/* Hello downtown  */}
              {this.props.smallMultiplesData.map(d => <div>
                {d.key}<br/>
                <DonorBarChart
                  data = {d}
                />
              </div>)}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

BodyComponent.propTypes = {}

BodyComponent.defaultProps = {}

export default BodyComponent
