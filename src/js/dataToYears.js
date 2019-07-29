/**
 * Get years array from a metric
 * @data {*} data JSON for a metric
 */

export default function(data) {
  const keys = Object.keys(data.map)
  return Object.keys(data.map[keys[0]])
}
