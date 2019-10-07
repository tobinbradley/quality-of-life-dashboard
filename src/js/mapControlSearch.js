const EventEmitter = require('events').EventEmitter

export default class {
  constructor({}) {
    this._eventEmitter = new EventEmitter()
  }

  onAdd(map) {
    this._map = map

    this._btn = document.createElement('button')
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-mapsearch'
    this._btn.type = 'button'
    this._btn.setAttribute('aria-label', 'Map Search')
    this._btn.setAttribute('title', 'Map Search')
    this._btn.onclick = () => {
      this._eventEmitter.emit('toggle', {})
      this._btn.parentNode.classList.toggle('mapbox-ctrl-active')
    }

    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    this._container.appendChild(this._btn)

    return this._container
  }

  on(type, fn) {
    this._eventEmitter.on(type, fn)
    return this
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}
