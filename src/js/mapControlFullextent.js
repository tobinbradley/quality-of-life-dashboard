export default class {
  constructor({ bbox = [-82.641, 34.115, -79.008, 36.762] }) {
    this._bbox = bbox
  }

  onAdd(map) {
    this._map = map

    this._btn = document.createElement('button')
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-fullextent'
    this._btn.type = 'button'
    this._btn.setAttribute('aria-label', 'zoom to full extent')
    this._btn.setAttribute('title', 'Zoom to full extent')
    this._btn.onclick = () => {
      map.fitBounds(this._bbox, {
        pitch: 0,
        bearing: 0
      })
    }

    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    this._container.appendChild(this._btn)

    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}
