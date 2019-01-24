import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './BodyComponent.scss'
import { Grid, Row, Col } from 'react-flexbox-grid';
import DeprivationScatterPlot from '../DeprivationScatterPlot/DeprivationScatterPlot';
import DonorBarChart from '../DonorBarChart/DonorBarChart'

class BodyComponent extends Component {
  constructor(props) {
    super(props)
  }
    
  render() {
    console.log(this.props);
    return (
      <div className="BodyComponent">
        <Grid fluid>
          <Row>
            <Col xs className='col left-col'> 
              {/* Hello uptown */}
            </Col>
            <Col xs className='col center-col'> 
              {/* Hello midtown */}
              <div className='scatterplotView'>
              <DeprivationScatterPlot
                data={this.props.scatterPlotData}
                // xVal='IMD_avg_score'
                xVal={this.props.scatterPlotXVal}
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
