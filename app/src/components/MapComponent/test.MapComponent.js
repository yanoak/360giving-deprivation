import React from 'react'
import { shallow } from 'enzyme'

import MapComponent from './MapComponent'

describe('MapComponent', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<MapComponent {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})