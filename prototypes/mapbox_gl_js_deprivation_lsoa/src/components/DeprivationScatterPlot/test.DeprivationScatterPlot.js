import React from 'react'
import { shallow } from 'enzyme'

import DeprivationScatterPlot from './DeprivationScatterPlot'

describe('DeprivationScatterPlot', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<DeprivationScatterPlot {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})