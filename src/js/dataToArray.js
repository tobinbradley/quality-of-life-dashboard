function dataToArray(data, year, keys = false) {
  let valsArray = []

  if (!keys) {
    keys = Object.keys(data)
  }

  keys.forEach(key => {
    if (data[key]) valsArray.push(data[key][year])
  })

  return valsArray.filter(Number)
}

function weightedDataToArray(data, weight, year, keys = false) {
  let valsArray = []

  if (!keys) {
    keys = Object.keys(data)
  }

  keys.forEach(key => {
    if (data[key] && weight[key]) {
      if (
        !isNaN(parseFloat(data[key][year])) &&
        !isNaN(parseFloat(weight[key][year]))
      ) {
        valsArray.push(data[key][year] * weight[key][year])
      }
    }
  })

  return valsArray.filter(Number)
}

export { dataToArray, weightedDataToArray }
