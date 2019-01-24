import React from 'react'
import { shallow } from 'enzyme'

import ScatterplotHolderComponent from './ScatterplotHolderComponent'

describe('ScatterplotHolderComponent', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<ScatterplotHolderComponent {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})