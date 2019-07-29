import { dataToArray, weightedDataToArray } from './dataToArray'

function sum(arr) {
  if (arr.length === 0) return '--'
  return arr.reduce(function(sum, x) {
    return sum + x
  }, 0)
}

function mean(arr) {
  if (arr.length === 0) return '--'
  return sum(arr) / arr.length
}

function weighted(arr, weight) {
  if (arr.length === 0) return '--'
  return sum(arr) / sum(weight)
}

export default function(data, year, calcType = 'mean', keys = false) {
  if (!keys) {
    keys = Object.keys(data.map)
  }
  if (keys.length === 0) {
    return '--'
  }

  if (calcType === 'sum') {
    let dataArray = dataToArray(data.map, year, keys)
    return sum(dataArray)
  }
  if (calcType === 'mean') {
    let dataArray = dataToArray(data.map, year, keys)
    return mean(dataArray)
  }
  if (calcType === 'weighted') {
    let dataArray = weightedDataToArray(data.map, data.w, year, keys)
    let wArray = dataToArray(data.w, year, keys)
    return weighted(dataArray, wArray)
  }

  return false
}
