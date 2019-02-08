import _ from 'lodash';

export const capitalize = (s) => {
  return s && s.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

export const prepKeyValuePairs = (list,id,labelFunc,filterBy) => {
  const unsortedList = list.map(d => {
    return {
      label: labelFunc(d),
      id: d[id],
      filter: d[filterBy]
    }
  })

  return _.sortBy(unsortedList, ['label']);
}

export const locationLabelFunc = (d) => {
  return d.placeName + " [" + d.id + "]"
}

export const donorLabelFunc = (d) => {
  return d['key']
}