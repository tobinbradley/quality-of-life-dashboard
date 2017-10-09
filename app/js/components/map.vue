<template lang="html">
    <div class="" style="position: relative; width: 100%; height: 100%">
        <div id="map"></div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import {prettyNumber} from '../modules/number_format';
import {replaceState} from '../modules/tracking';
import {scaleLinear} from 'd3-scale';

export default {
    name: 'sc-map',
    watch: {
        'sharedState.selected': 'styleNeighborhoods',
        'sharedState.breaks': 'updateBreaks',
        'sharedState.year': 'updateYear',
        'sharedState.marker': 'createMarker',
        'sharedState.zoomNeighborhoods': 'zoomNeighborhoods',
        'privateState.isPitched3D': 'toggle3D'
    },
    methods: {
        initMap: function() {
            let _this = this;
            _this.privateState.map = new mapboxgl.Map(_this.privateState.mapOptions);

            let map = _this.privateState.map;

            this.privateState.locationPopup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false
            });

            // add nav control
            var nav = new mapboxgl.NavigationControl();
            map.addControl(nav, 'top-right');

            // disable map rotation until 3D support added
            // map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            // after map initiated, grab geography and intiate/style neighborhoods
            map.on('style.load', function () {
                axios.get('data/geography.geojson.json')
                    .then(function(response) {
                        _this.privateState.mapLoaded = true;
                        _this.privateState.geoJSON = response.data;
                        _this.initNeighborhoods();
                        _this.styleNeighborhoods();
                        _this.initMapEvents();
                    });
            });

        },
        toggle3D: function() {
            let _this = this;
            let map = _this.privateState.map;
            let pitched = this.privateState.isPitched3D;

            if (pitched) {
                map.setLayoutProperty('neighborhoods', 'visibility', 'none');
                map.moveLayer('neighborhoods-fill-extrude');
                map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-height', _this.getHeight());
            } else {
                map.setLayoutProperty('neighborhoods', 'visibility', 'visible');
                map.moveLayer('neighborhoods-fill-extrude', 'building');
                map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-height', 0);
            }
        },
        initMapEvents: function() {
            let map = this.privateState.map;
            let _this = this;

            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('rotate', function(e) {
                if (map.getPitch() >= 20) {
                    _this.privateState.isPitched3D = true;
                } else {
                    _this.privateState.isPitched3D = false;
                }
            });

            // on feature click add or remove from selected set
            map.on('click', function (e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
                if (!features.length) {
                    return;
                }

                let feature = features[0];
                let featureIndex = _this.sharedState.selected.indexOf(feature.properties.id);

                if (featureIndex === -1) {
                    _this.sharedState.selected.push(feature.properties.id);
                } else {
                    _this.sharedState.selected.splice(featureIndex, 1);
                }

                replaceState(_this.sharedState.metricId, _this.sharedState.selected);
            });

            // fix for popup cancelling click event on iOS
            let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (!iOS) {
                // show feature info on mouse move
                map.on('mousemove', function (e) {
                    var features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
                    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

                    if (!features.length) {
                        popup.remove();
                        return;
                    }

                    let feature = features[0];
                    let id = feature.properties.id;
                    let data = _this.sharedState.metric.data.map[id][`y_${_this.sharedState.year}`];
                    let val = prettyNumber(data, _this.sharedState.metric.config.decimals, _this.sharedState.metric.config.prefix, _this.sharedState.metric.config.suffix);

                    popup.setLngLat(map.unproject(e.point))
                        .setHTML(`<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">NPA ${feature.properties.id}</h3>${val}</div>`)
                        .addTo(map);

                });
            }
        },
        initNeighborhoods: function() {
            let map = this.privateState.map;
            let _this = this;
            let geoJSON =  _this.privateState.geoJSON;

            map.addSource('neighborhoods', {
                type: 'geojson',
                data: geoJSON
            });

            // neighborhood boundaries
            map.addLayer({
                'id': 'neighborhoods',
                'type': 'line',
                'source': 'neighborhoods',
                'layout': {},
                'paint': {}
            }, 'place_other');

            map.addLayer({
                'id': 'neighborhoods-fill-extrude',
                'type': 'fill-extrusion',
                'source': 'neighborhoods',
                //'filter': ['!=', 'choropleth', 'null'],
                'paint': {
                    'fill-extrusion-opacity': 1
                }
            }, 'building');

            // markers layer
             map.addSource("markers", {
                 "type": "geojson",
                 "data": {
                     "type": "FeatureCollection",
                     "features": []
                 }
             });
             map.addLayer({
                 "id": "markers",
                 "type": "symbol",
                 "source": "markers",
                 "layout": {
                     "icon-image": "star-11",
                     "icon-size": 1.7
                 }
            });

        },
        styleNeighborhoods: function() {
            let map = this.privateState.map;
            let _this = this;

            map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-color', _this.getColors());
            map.setPaintProperty("neighborhoods", 'line-color', _this.getOutlineColor());
            map.setPaintProperty("neighborhoods", 'line-width', _this.getOutlineWidth());
            if (_this.privateState.isPitched3D) {
                map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-height', _this.getHeight());
            }
        },
        updateChoropleth: function() {
            let _this = this;
            if (this.privateState.mapLoaded) {
                this.styleNeighborhoods();
            }
        },
        updateBreaks: function() {
            this.privateState.metricId = this.sharedState.metricId;
            this.updateChoropleth();
        },
        updateYear: function() {
            if (this.sharedState.metricId === this.privateState.metricId) {
                this.updateChoropleth();
            }
        },
        geoJSONMerge: function() {
            let _this = this;
            let geoObj = geojsonDataMerge(_this.privateState.geoJSON, _this.sharedState.metric.data.map, _this.sharedState.year);
            return geoObj;
        },
        zoomNeighborhoods: function () {
            let bounds = new mapboxgl.LngLatBounds();
            let _this = this;

            this.privateState.geoJSON.features.forEach(function(feature) {
                if (_this.sharedState.zoomNeighborhoods.indexOf(feature.properties.id) !== -1) {
                    feature.geometry.coordinates.forEach(function(coord) {
                        coord.forEach(function(el) {
                            bounds.extend(el);
                        })
                    });
                }
            });

            this.privateState.map.fitBounds(bounds, {padding: 100});
        },

        createMarker: function() {
            let map = this.privateState.map;

            // create the marker
            let theLabel = `${this.sharedState.marker.label.replace(',', '<br />')}`;
            let markers = {
                   "type": "FeatureCollection",
                   "features": [{
                       "type": "Feature",
                       "geometry": {
                           "type": "Point",
                           "coordinates": [this.sharedState.marker.lng, this.sharedState.marker.lat]
                       },
                       "properties": {
                           "description": theLabel,
                           "type": "address"
                       }
                   }]
            };
            map.getSource("markers").setData(markers);
        },
        getFullBounds: function() {
            let bounds = new mapboxgl.LngLatBounds();
            let _this = this;

            this.privateState.geoJSON.features.forEach(function(feature) {
                feature.geometry.coordinates.forEach(function(coord) {
                    coord.forEach(function(el) {
                        bounds.extend(el);
                    })
                });
            });

            return bounds;
        },
        getSelectedBounds: function() {
            let bounds = new mapboxgl.LngLatBounds();
            let _this = this;

            this.privateState.geoJSON.features.forEach(function(feature) {
                if (_this.sharedState.selected.indexOf(feature.properties.id) !== -1) {
                    feature.geometry.coordinates.forEach(function(coord) {
                        coord.forEach(function(el) {
                            bounds.extend(el);
                        })
                    });
                }
            });

            return bounds;
        },
        getOutlineColor: function() {
            const stops = [];
            let _this = this;

            _this.sharedState.selected.forEach(id => {
                stops.push([id, '#ba00e4']);
            });

            let outline = {
                property: 'id',
                default: 'rgba(0,0,0,1)',
                type: 'categorical',
                stops: stops
            }

            if (stops.length > 0) {
                return outline;
            } else {
                return outline.default
            }
        },
        getOutlineWidth: function() {
            const stops = [];
            let _this = this;

            _this.sharedState.selected.forEach(id => {
                stops.push([id, 4]);
            });

            let outlineSize = {
                property: 'id',
                default: 0.4,
                type: 'categorical',
                stops: stops
            }

            if (stops.length > 0) {
                return outlineSize;
            } else {
                return outlineSize.default;
            }

            return stops;
        },
        getColors: function () {
            const stops = [];
            let _this = this;
            let data = _this.sharedState.metric.data.map;
            let breaks = this.sharedState.breaks;
            let colors = this.sharedState.colors;

            let color = function(val) {
                if (val <= breaks[1]) {
                    return colors[0];
                } else if (val <= breaks[2]) {
                    return colors[1];
                }
                 else if (val <= breaks[3]) {
                    return colors[2];
                }
                 else if (val <= breaks[4]) {
                    return colors[3];
                }
                 else if (val <= breaks[5]) {
                    return colors[4];
                }
            };

            Object.keys(data).forEach(id => {
                const value = data[id][`y_${_this.sharedState.year}`];

                if (value !== null) {
                    stops.push([id, color(value)]);
                }
            });

            let fillColor = {
                property: 'id',
                default: 'rgb(242,243,240)',
                type: 'categorical',
                stops: stops
            };

            return fillColor;
        },
        getHeight: function() {
            let _this = this;
            const stops = [];
            let data = _this.sharedState.metric.data.map;

            let heightAdjust = scaleLinear()
                    .domain([_this.sharedState.breaks[0], _this.sharedState.breaks[this.sharedState.breaks.length - 1]])
                    .range([0, 3000]);

            Object.keys(data).forEach(id => {
                const value = data[id][`y_${_this.sharedState.year}`];
                if (value !== null) {
                    stops.push([id, heightAdjust(value)]);
                }
            });

            let height = {
                property: 'id',
                default: 0,
                type: 'categorical',
                stops: stops
            }


            return height;
        }
    },

    mounted: function () {
        this.initMap();
    }

};
</script>

<style lang="css">
#map {
    width: 100%;
    height: 600px;
}
.mapboxgl-popup {
    max-width: 400px;
}
.mapboxgl-popup-content {
    padding: 10px 10px 5px;
}
#btnPitch {
    position: absolute;
    bottom: 4px;
    left: 4px;
    border-radius: 4px;
    /*width: 30px;*/
    height: 30px;
    min-width: 30px;
    padding: 4px 7px;
    /*box-shadow: 0 0 0 2px rgba(0,0,0,.1);*/
    line-height: inherit;
    background-color: rgba(158,158,158, 0.40);
    /*background: #ffffff;*/
}
</style>
