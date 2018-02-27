<template lang="html">
    <div class="" style="position: relative; width: 100%; height: 100%">
        <div id="map"></div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import axios from 'axios';
import {prettyNumber} from '../modules/number_format';
import {replaceState} from '../modules/tracking';
import {scaleLinear} from 'd3-scale';
import FullExtent from '../modules/map-fullextent.js';

export default {
    name: 'sc-map',
    watch: {
        'sharedState.selected': 'styleNeighborhoods',
        'sharedState.highlight': 'styleNeighborhoods',
        'sharedState.breaks': 'updateBreaks',
        'sharedState.year': 'updateYear',
        'sharedState.zoomNeighborhoods': 'zoomNeighborhoods',
        'sharedState.geography': 'updateGeography',
        'privateState.isPitched3D': 'toggle3D',
    },
    methods: {
        initMap: function() {
            let _this = this;
            _this.privateState.map = new mapboxgl.Map(_this.privateState.mapOptions);

            let map = _this.privateState.map;
            mapboxgl.accessToken = this.privateState.mapboxAccessToken;

            this.privateState.locationPopup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false
            });

            // add nav control
            let nav = new mapboxgl.NavigationControl();
            map.addControl(nav, 'top-right');

            // add full extent button
            map.addControl(new FullExtent({}), 'top-right');
            map.addControl(new mapboxgl.GeolocateControl, 'top-right');

            map.addControl(new MapboxGlGeocoder({
              accessToken: this.privateState.mapboxAccessToken,
              country: 'us',
              bbox: [-79.01, 35.87, -78.7, 36.15],
              placeholder: 'Search for an address',
              zoom: 14,
            }).on('result', (e) => {
              if (e.result) {
                // create the marker
                const markers = {
                  "type": "FeatureCollection",
                  "features": [{
                    "type": "Feature",
                    "geometry": {
                      "type": "Point",
                      "coordinates": e.result.center
                    },
                    "properties": {
                      "description": e.result.text,
                      "type": "address"
                    }
                  }]
                };

                if (map.getLayer("point")) {
                  map.getLayer("point").getSource().setData(markers);
                }
                else {
                  map.addLayer({
                    "id": "point",
                    "type": "symbol",
                    "source": {
                      "type": "geojson",
                      "data": markers
                    },
                    "layout": {
                      "icon-image": "marker-11",
                      "icon-size": 10,
                    }
                  });
                }
              }
            }), 'bottom-right');

            // disable map rotation until 3D support added
            // map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            // after map initiated, grab geography and initiate/style neighborhoods
            map.once('style.load', function () {
                axios.get(`data/${_this.sharedState.geography.id}.geojson.json`)
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
                let features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
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

                replaceState(_this.sharedState.metricId, _this.sharedState.selected, _this.sharedState.geography.id);
            });

            // fix for popup cancelling click event on iOS
            let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (!iOS) {
                // show feature info on mouse move
                map.on('mousemove', function (e) {
                    let features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
                    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

                    if (!features.length) {
                        popup.remove();
                        return;
                    }

                    let feature = features[0];
                    let id = feature.properties.id;
                    let data = _this.sharedState.metric.data.map[id][`y_${_this.sharedState.year}`];
                    let geographyLabel = _this.sharedState.geography.label(id);
                    let val = prettyNumber(data, _this.sharedState.metric.config.decimals, _this.sharedState.metric.config.prefix, _this.sharedState.metric.config.suffix);
                    popup.setLngLat(map.unproject(e.point))
                        .setHTML(`<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">${geographyLabel}</h3>${val}</div>`)
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
            // TODO: Is `building` the right layer for this to be before?
            map.addLayer({
                'id': 'neighborhoods',
                'type': 'line',
                'source': 'neighborhoods',
                'layout': {},
                'paint': {}
            }, 'waterway_river');

            map.addLayer({
                'id': 'neighborhoods-fill-extrude',
                'type': 'fill-extrusion',
                'source': 'neighborhoods',
                'paint': {
                    'fill-extrusion-opacity': 1
                }
            }, 'neighborhoods');
        },
        styleNeighborhoods: function() {
          let map = this.privateState.map, _this = this;
          if (map.getLayer('neighborhoods')) {
            map.setPaintProperty('neighborhoods', 'line-color', _this.getOutlineColor());
            map.setPaintProperty('neighborhoods', 'line-width', _this.getOutlineWidth());
          }
          if (map.getLayer('neighborhoods-fill-extrude')) {
            map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-color', _this.getColors());

            if (_this.privateState.isPitched3D) {
              map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-height', _this.getHeight());
            }
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
        updateGeography: function() {
          let _this = this;
          this.privateState.geographyId = this.sharedState.geography.id;
          axios.get(`data/${_this.sharedState.geography.id}.geojson.json`)
            .then(function(response) {
            _this.privateState.map.getSource('neighborhoods').setData(response.data);
            _this.styleNeighborhoods();
            _this.initMapEvents();
          });
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

                if (_this.sharedState.highlight.indexOf(id) !== -1) {
                  stops.push([id, '#F7E55B']);
                } else if (value !== null) {
                    stops.push([id, color(value)]);
                }
            });

            return {
              property: 'id',
              default: 'rgb(242,243,240)',
              type: 'categorical',
              stops: stops
            };
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

            return {
              property: 'id',
              default: 0,
              type: 'categorical',
              stops: stops
            };
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
