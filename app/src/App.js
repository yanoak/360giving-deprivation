import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { loadAllData } from './DataLoading';
import { prepAllData } from './DataHandling';
import FiltersComponent from './components/FiltersComponent/FiltersComponent';
import BodyComponent from './components/BodyComponent/BodyComponent';
import TempBodyComponent from './components/TempBodyComponent/TempBodyComponent';
import _ from 'lodash';

import { Grid, Row, Col } from 'react-flexbox-grid';
import Select from 'react-select';


class App extends Component {

	constructor() {
		super();
		this.state = {
			data: [],
			mutatedData: {
				// companyPayments: []
			},
			layerControls: [],
			selectedRegion: 'eng',
			selectedGeoLevel: 'LAD',
			selectedComparison: ['deprivation','comparison_IMD_avg_score'],
			filters: {},
			yMinLimit: 1000,
			dimensions: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		}
		this.updateDimensions = this.updateDimensions.bind(this);
	}
  
	
	addFilter = (filters,toggle) => {
		console.log(filters)
		const filterKeys = Object.keys(filters);
		let newFilterObj = this.state.filters;

		filterKeys.forEach(k => {
			console.log(newFilterObj[k]);
			console.log(filters[k]);
			if (!toggle || filters[k]==='reset' 
			|| !newFilterObj[k] || newFilterObj[k]==='reset') {
				newFilterObj[k] = filters[k];
			} else {
				let consolidatedFilters = [];
				consolidatedFilters = consolidatedFilters
					.concat(newFilterObj[k].filter(d => !(filters[k]).includes(d)));
				console.log(consolidatedFilters);
				consolidatedFilters =	consolidatedFilters
					.concat(filters[k].filter(d => !(newFilterObj[k]).includes(d)));
				console.log(consolidatedFilters);

				newFilterObj[k] = consolidatedFilters;
			}
		})

		this.setState({
			filters: newFilterObj,
			data: prepAllData(this.state.data,
				this.state.selectedRegion,
				this.state.selectedGeoLevel,
				this.state.selectedComparison,
				newFilterObj)
		});
		
	}

  componentDidMount() { 
		window.addEventListener("resize", this.updateDimensions);
		this.getData();
	}  
	
	updateDimensions() {
    this.setState({
      dimensions: {
				height: window.innerHeight, 
				width: window.innerWidth
			}
    });
  }
	
	getData() {
    loadAllData()
      .then(data => prepAllData(data,
        this.state.selectedRegion,
        this.state.selectedGeoLevel,
				this.state.selectedComparison,
				this.state.filters,
				this.state.yMinLimit))
			.then(data =>
				// set initial data
				this.setState({ data },
					() => {
						// set mutated data to initial data on load so filters can access data changes
						this.setState({ mutatedData: this.state.data },
							() => {
								console.log(`(mutatedData === data) : ${this.state.mutatedData === this.state.data}`)
								console.log(this.state.mutatedData);
							}
						)}
				))
	}


  render() {
    console.log(this.state.data);

		const handleRegionChange = (selectedOption) => {
			this.setState({ 
				selectedRegion: selectedOption.value,
				filters: {},
				data: prepAllData(this.state.data,
					selectedOption.value,
					this.state.selectedGeoLevel,
					this.state.selectedComparison,
					{},
					this.state.yMinLimit)
			});
			console.log(`Location selected:`, selectedOption);
		}

		const handleGeoChange = (selectedOption) => {
			this.setState({ 
				selectedGeoLevel: selectedOption.value,
				filters: {},
				data: prepAllData(this.state.data,
					this.state.selectedRegion,
					selectedOption.value,
					this.state.selectedComparison,
					{},
					this.state.yMinLimit)
			});
			console.log(`Geo level selected:`, selectedOption);
		}

		const handleComparisonChange = (selectedOption) => {
			this.setState({ 
				selectedComparison: selectedOption.value,
				data: prepAllData(this.state.data,
					this.state.selectedRegion,
					this.state.selectedGeoLevel,
					selectedOption.value,
					this.state.filters,
					this.state.yMinLimit)
			});
			console.log(`Comparison var selected:`, selectedOption);
		}

		const getComparisonVarLabel = () => {
			return this.state.data.comparisonVars
				.filter(d => d.value[0] == this.state.selectedComparison[0] &&
					d.value[1] == this.state.selectedComparison[1])[0]
		}

		const isLoading = !!(_.isEmpty(this.state.data)) ? true : false;

		const regionPicker = <div className='regionPickerWrapper'>
			<label>
				Region: 
				{!!isLoading
          ? 'loading'
          :	<Select
							value={this.state.data.regions[this.state.selectedRegion]}
							onChange={handleRegionChange}
							options={Object.values(this.state.data.regions)}
							className='regionPicker'
						/>
				}
			</label>
		</div>

		const geoPicker = <div className='geoPickerWrapper'>
			<label>
				Administrative Level: 
					{!!isLoading
					? 'loading'
					:	<Select
							value={this.state.data.geoLevels[this.state.selectedGeoLevel]}
							onChange={handleGeoChange}
							options={Object.values(this.state.data.geoLevels)}
							className='geoPicker'
						/>
				}
			</label>
		</div>

		const comparisonPicker = <div className='comparisonPickerWrapper'>
		<label>
			Comparison Variable: 
			{console.log(this.state.data.comparisonVars)}
				{!!isLoading
				? 'loading'
				:	<Select
						value={getComparisonVarLabel()}
						onChange={handleComparisonChange}
						options={Object.values(this.state.data.comparisonVars)}
						className='comparisonPicker'
					/>
			}
		</label>
		</div>

    return (
      <div className="App">
			{!!isLoading
          ? 'loading'
          : <div>
						<header className="App-header">
							<Grid fluid>
								<Row>
									<Col xs className='col left-col'> 
										{/* Hello uptown */}
										{regionPicker}
									</Col>
									<Col xs className='col center-col'> 
										{/* Hello midtown */}
										{geoPicker}
									</Col>
									<Col xs className='col right-col'> 
										{/* Hello downtown  */}
										{comparisonPicker}
									</Col>
								</Row>
							</Grid>
						</header>
						{/* <FiltersComponent/> */}
						<BodyComponent
							smallMultiplesData={this.state.data.dataForSmallMultiples}
							scatterPlotData={this.state.data.dataForScatter}
							mapData={this.state.data.dataForMap}
							allMapSources={this.state.data.allMapSources}
							// scatterPlotXVal={this.state.selectedComparison[1].slice(11)}
							scatterPlotXVal={this.state.selectedComparison[1]}
							scatterPlotXValLabel={getComparisonVarLabel()}
							yMinLimit={this.state.yMinLimit}
							addFilter={this.addFilter.bind(this)}
							yearsRange={this.state.filters.years}
							mapFormatting={this.state.data.regions[this.state.selectedRegion]}
							mapGeoId={this.state.data.geo[this.state.selectedRegion][this.state.selectedGeoLevel].id}
							mapGeoPlaceName={this.state.data.geo[this.state.selectedRegion][this.state.selectedGeoLevel].placeName}
							dimensions={this.state.dimensions}
							infoBoxes={this.state.data.infoBoxes}
						/>
						{/* <TempBodyComponent
							smallMultiplesData={this.state.data.dataForSmallMultiples}
							scatterPlotData={this.state.data.dataForScatter}
							scatterPlotXVal={this.state.selectedComparison[1].slice(11)}
						/> */}
					</div>
			}
      </div>
    );
  }
}

export default App;
