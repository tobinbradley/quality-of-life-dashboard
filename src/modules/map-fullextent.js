 
export default class FullExtent {
    
    constructor({center = [-80.84, 35.26], zoom = 9.3}) {
        this._center = center;
        this._zoom = zoom;
    }

    onAdd(map) {
        this._map = map;
        let _this = this; 

        this._btn = document.createElement('button');
        this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-fullextent';
        this._btn.type = 'button';
        this._btn.setAttribute('aria-label', 'zoom to full extent');
        this._btn.onclick = function() { 
            map.flyTo({center: _this._center, zoom: _this._zoom});            
        };
        

        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.appendChild(this._btn);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}
