import React from 'react'
import { shallow } from 'enzyme'

import DonorBarChart from './DonorBarChart'

describe('DonorBarChart', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<DonorBarChart {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})