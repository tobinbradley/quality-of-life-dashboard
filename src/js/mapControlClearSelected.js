const EventEmitter = require('events').EventEmitter

export default class {
  constructor({}) {
    this._eventEmitter = new EventEmitter()
  }

  onAdd(map) {
    this._map = map

    this._btn = document.createElement('button')
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-clearselected'
    this._btn.type = 'button'
    this._btn.setAttribute('aria-label', 'clear selected')
    this._btn.setAttribute('title', 'Clear selected')
    this._btn.onclick = () => {
      this._eventEmitter.emit('clear', {})
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
