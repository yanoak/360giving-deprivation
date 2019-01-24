import React from 'react'
import { shallow } from 'enzyme'

import SmallMultiplesHolderComponent from './SmallMultiplesHolderComponent'

describe('SmallMultiplesHolderComponent', () => {
  let component, props

  beforeEach(() => {
    props = {}
    component = shallow(<SmallMultiplesHolderComponent {...props} />)
  })

  it('should', () => {
    expect(component).toMatchSnapshot()
  })
})