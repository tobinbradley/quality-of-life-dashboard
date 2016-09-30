<template lang="html">
    <div id="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
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

            // disable map rotation using right click + drag and touch
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            map.on('moveend', function() {
                let bounds = map.getBounds();
                _this.sharedState.mapBounds = [bounds._sw.lng.toFixed(4), bounds._sw.lat.toFixed(4), bounds._ne.lng.toFixed(4), bounds._ne.lat.toFixed(4)];
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
                    .setHTML(val)
                    .addTo(map);
            });
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
            }, _this.privateState.neighborhoodsBefore);

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
            }, _this.privateState.neighborhoodsSelectedBefore);

            // neighborhoods fill
            map.addLayer({
                'id': 'neighborhoods-fill',
                'type': 'fill',
                'source': 'neighborhoods',
                'layout': {},
                'filter': ['!=', 'choropleth', 'null'],
                'paint': {
                    'fill-opacity': 1
                }
            }, 'neighborhoods-line');

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
                "interactive": true,
                "layout": {
                    "icon-image": "marker"
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
            // this.privateState.locationPopup.setLngLat([this.sharedState.marker.lng, this.sharedState.marker.lat])
            //     .setHTML(theLabel)
            //     .addTo(map);
        }
    },
    ready: function () {
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
    /*color: white;
    background-color: black;*/
    padding: 5px 10px;
    font-weight: bold;
}
/*.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
    border-bottom-color: black;
}
.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip {
    border-bottom-color: black;
}
.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip {
    border-bottom-color: black;
}
.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
    border-top-color: black;
}
.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip {
    border-top-color: black;
}
.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip {
    border-top-color: black;
}
.mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
    border-right-color: black;
}
.mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
    border-left-color: black;
}*/
</style>
