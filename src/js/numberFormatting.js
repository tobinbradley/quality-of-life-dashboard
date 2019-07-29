// commas
function commaNumber(num) {
  return num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}

// rounding
function roundNumber(num, decimals = 0) {
  return Number(num.toFixed(decimals))
}

// shorten
function shortenNumber(number, decPlaces) {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces)
  // Enumerate number abbreviations
  var abbrev = ['k', 'm', 'b', 't']
  for (var i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3)
    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces
      if (number == 1000 && i < abbrev.length - 1) {
        number = 1
        i++
      }
      number += abbrev[i]
      break
    }
  }
  return number
}

// suffix
function suffixNumber(num, suffix = '') {
  return `${num}${suffix}`
}

// prefix
function prefixNumber(num, prefix = '') {
  return `${prefix}${num}`
}

/**
 * formatShortNumber
 * @param {number} num number to be formatted
 * @param {object} options data configuration options for the metric
 */
function formatShortNumber(num, options) {
  // round
  num = roundNumber(num, options.decimals || 0)
  // shorten
  let numStr = shortenNumber(num, 1)
  // suffix
  numStr = suffixNumber(numStr, options.suffix || '')
  // prefix
  numStr = prefixNumber(numStr, options.prefix || '')

  return numStr
}

/**
 * formatNumber
 * @param {number} num number to be formatted
 * @param {object} options data configuration options for the metric
 * @param {boolean} commas whether or not to add commas, default is true
 */
function formatNumber(num, options, commas = true) {
  if (isNaN(parseFloat(num))) return '--'
  // round
  let numStr = roundNumber(num, options.decimals || 0).toString()
  // commas
  if (commas) numStr = commaNumber(numStr)
  // prefix
  numStr = prefixNumber(numStr, options.prefix || '')
  // suffix
  numStr = suffixNumber(numStr, options.suffix || '')

  return numStr
}

export { formatShortNumber, formatNumber }
