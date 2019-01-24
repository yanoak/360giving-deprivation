import React from 'react'
import { shallow } from 'enzyme'

import FiltersComponent from './FiltersComponent'

describe('FiltersComponent', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<FiltersComponent {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})