import React from 'react'
import { shallow } from 'enzyme'

import TempBodyComponent from './TempBodyComponent'

describe('TempBodyComponent', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<TempBodyComponent {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})