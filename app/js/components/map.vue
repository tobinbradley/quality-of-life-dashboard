<template lang="html">
    <div class="" style="position: relative; width: 100%; height: 100%">
        <div id="map"></div>
    </div>
</template>

<script>
//import mapboxgl from 'mapbox-gl';
import mapboxgl from 'mapbox-gl/src/index.js';
import axios from 'axios';
import geojsonDataMerge from '../modules/geojsondatamerge';
import {prettyNumber} from '../modules/number_format';
import getURLParameter from '../modules/geturlparams';
import {replaceState} from '../modules/tracking';

export default {
    name: 'sc-map',
    watch: {
        'sharedState.selected': 'selectNeighborhoods',
        'sharedState.breaks': 'updateBreaks',
        'sharedState.year': 'updateYear',
        'sharedState.marker': 'createMarker',
        'sharedState.zoomNeighborhoods': 'zoomNeighborhoods'
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
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            map.on('rotate', function(e) {
                if (map.getPitch() > 25) {
                    map.setLayoutProperty('neighborhoods-fill-extrude', 'visibility', 'visible');
                    map.setLayoutProperty('neighborhoods-fill-selected', 'visibility', 'visible');
                } else {
                    map.setLayoutProperty('neighborhoods-fill-extrude', 'visibility', 'none');
                    map.setLayoutProperty('neighborhoods-fill-selected', 'visibility', 'none');
                }
            });

            // after map initiated, grab geography and intiate/style neighborhoods
            map.on('style.load', function () {
                axios.get('data/geography.geojson.json')
                    .then(function(response) {
                        _this.privateState.mapLoaded = true;
                        _this.privateState.geoJSON = response.data;
                        _this.initNeighborhoods();
                        _this.selectNeighborhoods();
                        _this.styleNeighborhoods();
                        _this.initMapEvents();
                    });
            });

        },
        togglePitch: function() {
            let _this = this;
            if (this.privateState.map.getPitch() === 0) {
                this.privateState.map.easeTo({pitch: 75, bearing: -40});
            } else {
                this.privateState.map.easeTo({pitch: 0, bearing: 0});
            }
        },
        initMapEvents: function() {
            let map = this.privateState.map;
            let _this = this;

            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            // on feature click add or remove from selected set
            map.on('click', function (e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill'] });
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
            });

            // fix for popup cancelling click event on iOS
            let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (!iOS) {
                // show feature info on mouse move
                map.on('mousemove', function (e) {
                    var features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill'] });
                    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

                    if (!features.length) {
                        popup.remove();
                        return;
                    }

                    let feature = features[0];
                    let val = prettyNumber(feature.properties.choropleth, _this.sharedState.metric.config.decimals, _this.sharedState.metric.config.prefix, _this.sharedState.metric.config.suffix);

                    popup.setLngLat(map.unproject(e.point))
                        .setHTML(`<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">NPA ${feature.properties.id}</h1>${val}</div>`)
                        .addTo(map);

                });
            }
        },
        initNeighborhoods: function() {
            let map = this.privateState.map;
            let _this = this;
            let geoJSON =  _this.geoJSONMerge();

            map.addSource('neighborhoods', {
                type: 'geojson',
                data: geoJSON
            });

            // neighborhood boundaries
            map.addLayer({
                'id': 'neighborhoods-line',
                'type': 'line',
                'source': 'neighborhoods',
                'layout': {},
                'paint': {
                    'line-color': '#666',
                    'line-width': 0.8
                }
            }, 'building');

            // neighborhood boundaries highlight
            map.addLayer({
                'id': 'neighborhoods-line-selected',
                'type': 'line',
                'source': 'neighborhoods',
                'layout': {},
                "filter": ["in", "id", "-999999"],
                'paint': {
                    'line-color': '#ba00e4',
                    'line-width': {
                        "base": 2,
                        "stops": [
                            [
                                7,
                                2
                            ],
                            [
                                13,
                                5
                            ],
                            [
                                16,
                                8
                            ]
                        ]
                    }
                }
            }, 'water_label');
            map.addLayer({
                'id': 'neighborhoods-fill-selected',
                'type': 'fill-extrusion',
                'source': 'neighborhoods',
                'layout': {
                    'visibility': 'none'
                },
                "filter": ["in", "id", "-999999"],
                'paint': {
                    'fill-extrusion-color': '#ba00e4',
                    'fill-extrusion-opacity': 0.7,
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    }
                }
            }, 'water_label');

            map.addLayer({
                'id': 'neighborhoods-fill',
                'type': 'fill',
                'source': 'neighborhoods',
                'filter': ['!=', 'choropleth', 'null'],
                'paint': {
                }
            }, 'neighborhoods-line');

            map.addLayer({
                'id': 'neighborhoods-fill-extrude',
                'type': 'fill-extrusion',
                'source': 'neighborhoods',
                'layout': {
                    'visibility': 'none'
                },
                'filter': ['!=', 'choropleth', 'null'],
                'paint': {
                    'fill-extrusion-opacity': 0.8,
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    }
                }
            }, 'neighborhoods-fill-selected');

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
        selectNeighborhoods: function() {
            if (this.privateState.mapLoaded === true) {
                let map = this.privateState.map;
                let selected = this.sharedState.selected;
                let filter;

                if (selected.length > 0) {
                    filter = ["in", "id"];
                    for (let i = 0; i < selected.length; i++) {
                        filter.push(selected[i]);
                    }
                } else {
                    filter = ["in", "id", "-999999"];
                }

                // push selected state
                let linkMetric = '';
                if (getURLParameter("m")) {
                    linkMetric = getURLParameter("m");
                }
                replaceState(linkMetric, this.sharedState.selected);

                map.setFilter("neighborhoods-line-selected", filter);
                map.setFilter("neighborhoods-fill-selected", filter);
            }
        },
        styleNeighborhoods: function() {
                let map = this.privateState.map;
                let breaks = this.sharedState.breaks;
                let colors = this.sharedState.colors;

                let fillColor = {
                    property: 'choropleth',
                    stops: [
                        [breaks[1], colors[0]],
                        [breaks[2], colors[1]],
                        [breaks[3], colors[2]],
                        [breaks[4], colors[3]],
                        [breaks[5], colors[4]]
                    ]
                };
                map.setPaintProperty("neighborhoods-fill", 'fill-color', fillColor);
                map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-color', fillColor);
        },
        updateChoropleth: function() {
            let _this = this;
            if (this.privateState.mapLoaded) {
                let geoJSON =  _this.geoJSONMerge();

                this.privateState.map.getSource('neighborhoods').setData(geoJSON);

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