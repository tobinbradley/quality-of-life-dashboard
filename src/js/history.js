function readMetrics(dataConfig) {
  const hash = window.location.hash

  // gtfo if nothing passed
  if (hash.length === 0) return false

  const args = hash
    .split('/')[0]
    .replace('#', '')
    .split(',')

  // purge anything not in metric config
  const ids = dataConfig.map(el => el.metric)
  let check = true
  args.forEach(arg => {
    if (ids.indexOf(arg) === -1) {
      check = false
      return false
    }
  })

  return check ? args : false
}

function readSelected(selected, defaultGeojson) {
  const hash = window.location.hash

  // gtfo if nothing passed
  if (hash.length === 0) return false

  const args = hash.split('/')

  // gtfo if no selected
  if (args.length < 2) return false

  for (let i = 1; i < args.length; i++) {
    // if no ':', apply list to default geojson
    if (args[i].indexOf(':') === -1) {
      args[i] = `${defaultGeojson}:${args[i]}`
    }
    const selectedParts = args[i].split(':')
    if (selected[selectedParts[0]]) {
      selected[selectedParts[0]] = selectedParts[1].split(',')
    }
  }
}

function writeState(metrics, selected) {
  let url = `#${metrics.join(',')}`

  const keys = Object.keys(selected)

  keys.forEach(key => {
    if (selected[key].length > 0) {
      url += `/${key}:${selected[key].join(',')}`
    }
  })

  // push state
  history.pushState(
    {
      metric: metrics,
      selected: selected
    },
    'Quality of Life Explorer',
    url
  )
}

export { readMetrics, readSelected, writeState }
