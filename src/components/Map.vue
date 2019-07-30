<template>
  <section class="mapcontainer">
    <div :id="mapId" class="map" ref="map"></div>
    <Legend :breaks="breaks" :dataConfig="dataConfig" :cardData="cardData" :yearIndex="yearIndex" @updateHighlight="updateHighlight" />
  </section>
</template>

<script>
  import Legend from './Legend'
  import mapboxgl from 'mapbox-gl'
  import {ckmeans, min, max} from 'simple-statistics'
  import dataToYears from '../js/dataToYears'
  import { dataToArray } from '../js/dataToArray'
  import { formatNumber } from '../js/numberFormatting'
  import FullExtentControl from '../js/mapControlFullextent'
  import ClearSelectedControl from '../js/mapControlClearSelected'
  import mapStyle from '../../data/gl-style/positron-mecklenburg.json'

  // BEHOLD THIS SMELLY THING
  // There's a slight delay between when draggable has done its thing and the
  // map should resize the container. The map resize event is firing before the
  // container is at the new height. So I takes a 100ms nap and fire it manually
  // like an asshole.
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export default {
    name: 'qolmap',
    components: {
      Legend
    },
    props: {
      cardData: {
        type: Object
      },
      yearIndex: {
        type: Number
      },
      geojson: {
        type: Object
      },
      cardSize: {
        type: String
      },
      highlight: {
        type: Array
      },
      metricId: String,
      geocode: Object
    },
    data() {
      return {
        map: null,
        geoMarker: null,
        navControl: new mapboxgl.NavigationControl(),
        fullscreenControl: new mapboxgl.FullscreenControl(),
        clearSelectedControl: new ClearSelectedControl({}),
        geolocateControl: new mapboxgl.GeolocateControl({
          positionOptions: {
          enableHighAccuracy: true
          },
          trackUserLocation: true
        }),
        fullextentControl: null,
        show3D: false
      }
    },
    computed: {
      mapId() {
        return `map-${this.dataConfig.metric}`
      },
      years() {
        return dataToYears(this.cardData)
      },
      dataConfig() {
        return this.$store.getters.dataConfig(this.metricId)
      },
      dataOptions() {
        return this.$store.state.dataOptions
      },
      geojsonName() {
        return this.$store.getters.geojsonName(this.metricId)
      },
      selected() {
        const geojson = this.dataConfig.geojson || this.dataOptions.defaultgeojson
        return this.$store.state.selected[geojson]
      },
      mapColors() {
        return this.dataOptions.colors[this.dataConfig.colors] || this.dataOptions.colors['default']
      },
      breaks() {
        const _this = this

        // years to use for ckmeans
        let years = dataToYears(this.cardData)

        // array of values for ckmeans
        let vals = []
        years.forEach((year) => {
          let dataArray = dataToArray(_this.cardData.map, year)
          vals.push(...dataArray)
        })

        // ckmeans into min break points
        return ckmeans(vals, this.mapColors.length).map(elem => { return [min(elem), max(elem)] })
      },
      layerOptions() {
        return this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojsonName })[0]
      },
      displayMode() {
        return this.$store.state.displayMode
      }
    },
    mounted () {
      // create markers for geocoding
      const el = document.createElement('div');
      el.className = 'mapboxgl-user-location-dot'
      this.geoMarker = new mapboxgl.Marker(el)

      // initialize map
      this.renderMap()
    },
    watch: {
      yearIndex (newValue, oldValue) {
        this.setChoropleth()
      },
      selected (newValue, oldValue) {
        this.setBoundary()
      },
      highlight (newValue, oldValue) {
        this.setChoropleth()
      },
      displayMode () {
        this.map.resize()
      },
      geocode(val) {
        if (val.id) {
          this.zoomPolys(val.id)
        }
        else {
          const features = this.map.queryRenderedFeatures(this.map.project(val.lnglat.split(",")), {
            layers: ['geographyFill']
          })
          this.$store.commit("addSelected", { geography: this.geojsonName, id: [features[0].properties.id] })

          this.geoMarker
            .setLngLat(val.lnglat.split(","))
            .addTo(this.map)

          this.map.flyTo({
            center: val.lnglat.split(","),
            zoom: 13
          })
        }
      },
      cardSize(newValue, oldValue) {
        if (this.map) {
          this.map.resize()
          this.map.fitBounds(this.getFullExtent(), {
            pitch: 0,
            bearing: 0
          })

          if (newValue === 'small') {
            this.removeInteractive()
          }
          else {
            this.setInteractive()
          }
        }
      },
      show3D (newValue, oldValue) {
        if (newValue) {
          const stops = []
          const data = this.cardData.map
          let breaks = this.breaks

          const max = this.breaks[this.breaks.length - 1][1]

          Object.keys(data).forEach(id => {
            const value = data[id][`${this.years[this.yearIndex]}`]
            if (value !== null) {
              stops.push([id, (value / max) * 5000 ])
            }
          })

          const height = {
            property: "id",
            default: 0,
            type: "categorical",
            stops: stops
          }

          this.map.moveLayer("geographyFill")
          this.map.setPaintProperty(
            "geographyFill",
            "fill-extrusion-height",
            height
          )
        } else {
          this.map.moveLayer("geographyFill", this.dataOptions.fillLayerBefore)
          this.map.setPaintProperty("geographyFill", "fill-extrusion-height", 0)
        }
      }
    },
    methods: {
      renderMap() {
        let bounds = this.getFullExtent()

        // create full extent control with bounds
        this.FullExtentControl = new FullExtentControl({bbox: bounds})

        const mapOptions = {
          container: this.mapId,
          style: this.cardSize === 'large' ? mapStyle : this.initHiddenBackground(mapStyle),
          bounds: bounds,
          maxBounds: this.dataOptions.maxBounds,
          attributionControl: false,
          interactive: this.cardSize === 'large',
          preserveDrawingBuffer: navigator.userAgent.toLowerCase().indexOf("firefox") > -1
        }

        const map = this.map = new mapboxgl.Map(mapOptions)

        map.on("load", () => {
          this.initGeoJSON()
          this.setChoropleth()
          this.setBoundary()
          this.setMapHover()
          if (this.displayMode !== 'embed') this.setMapClick()
          if (map.getCanvas().width > 400) this.setInteractive()
        })

        map.on("rotate", e => {
          map.getPitch() >= 20 ? this.show3D = true : this.show3D = false
        })

        map.on("resize", e => {
          if (this.cardSize === 'small') {
            this.map.fitBounds(this.getFullExtent(), {
              pitch: 0,
              bearing: 0
            })
          }
        })

      },
      getFullExtent() {
        let bounds = new mapboxgl.LngLatBounds()

        // get geojson bounds
        this.geojson.features.forEach((feature) => {
          feature.geometry.coordinates.forEach(function(coord) {
            coord.forEach(function(el) {
              bounds.extend(el)
            })
          })
        })

        return bounds
      },
      zoomPolys(id) {
        const bounds = new mapboxgl.LngLatBounds()

        const zoomFeatures = this.geojson.features.filter(el => id.indexOf(el.properties.id) !== -1)

        // get geojson bounds
        zoomFeatures.forEach((feature) => {
          feature.geometry.coordinates.forEach(function(coord) {
            coord.forEach(function(el) {
              bounds.extend(el)
            })
          })
        })

        this.map.fitBounds(bounds, {
          pitch: 0,
          bearing: 0
        })
      },
      removeInteractive() {
        // set layer visibility
        this.toggleBackgroundLayers('small')
        // turn off interactivity
        this.map.scrollZoom.disable()
        this.map.boxZoom.disable()
        this.map.dragRotate.disable()
        this.map.dragPan.disable()
        this.map.keyboard.disable()
        this.map.doubleClickZoom.disable()
        this.map.touchZoomRotate.disable()
        // add geography events
        // remove controls
        try {
          this.map.removeControl(this.navControl)
          this.map.removeControl(this.fullscreenControl)
          this.map.removeControl(this.FullExtentControl)
          this.map.removeControl(this.clearSelectedControl)
          this.map.removeControl(this.geolocateControl)
        } catch (error) { }
      },
      setInteractive() {
        // set layer visibility
        this.toggleBackgroundLayers('large')

        // turn on interactivity
        this.map.scrollZoom.enable()
        this.map.boxZoom.enable()
        this.map.dragRotate.enable()
        this.map.dragPan.enable()
        this.map.keyboard.enable()
        this.map.doubleClickZoom.enable()
        this.map.touchZoomRotate.enable()
        // add geography events
        // add controls
        this.map.addControl(this.navControl, 'top-left')
        if (this.displayMode !== 'embed') this.map.addControl(this.geolocateControl, 'top-left')
        this.map.addControl(this.fullscreenControl, 'top-left')
        this.map.addControl(this.FullExtentControl, 'top-left')
        if (this.displayMode !== 'embed') this.map.addControl(this.clearSelectedControl, 'top-left')

        // callbacks for control
        this.clearSelectedControl.on("clear", ev => {
          this.$store.commit("setSelected", { geography: this.geojsonName, selected: [] })
        })
        this.geolocateControl.on('geolocate', ev => {
          const features = this.map.queryRenderedFeatures(this.map.project([ev.coords.longitude, ev.coords.latitude]), {
            layers: ['geographyFill']
          })
          // if there is a poly under that point, do your thing
          if (features[0] && this.selected.indexOf(features[0].properties.id) === -1) {
            this.$store.commit("addSelected", { geography: this.geojsonName, id: [features[0].properties.id] })
          }
        })

      },
      initGeoJSON() {
        const map = this.map
        const _this = this

        // outline layer
        map.addLayer(
          {
            id: "geographyLine",
            type: "line",
            source: {
              type: "geojson",
              data: _this.geojson
            },
            layout: {},
            paint: {
              "line-width": 0.1,
              "line-opacity": 0.5,
              "line-color": "white"
            }
          },
          this.dataOptions.lineLayerBefore
        )

        // fill layer
        map.addLayer(
          {
            id: "geographyFill",
            type: "fill-extrusion",
            source: {
              type: "geojson",
              data: _this.geojson
            },
            paint: {
              "fill-extrusion-opacity": 1
            }
          },
          this.dataOptions.fillLayerBefore
        )

      },
      setChoropleth() {
        const stops = [];
        let _this = this;
        let data = _this.cardData.map
        let breaks = this.breaks

        let color = function(val) {
          for (let i = 0; i < breaks.length; i++) {
            if (val <= breaks[i][1]) return _this.mapColors[i]
          }
        }

        Object.keys(data).forEach(id => {
          const value = data[id][`${_this.years[_this.yearIndex]}`]
          if (this.highlight.indexOf(id) !== -1) {
            stops.push([id, "#F7E55B"])
          } else if (value !== null) {
            stops.push([id, color(value)])
          }
        })

        let fillColor = {
          property: "id",
          default: "rgb(242,243,240)",
          type: "categorical",
          stops: stops
        }

        this.map.setPaintProperty(
          "geographyFill",
          "fill-extrusion-color",
          fillColor
        )
      },
      setBoundary() {
        if (this.selected.length > 0) {
          const colorStops = []
          const widthStops = []

          this.selected.forEach(id => {
            colorStops.push([id, "#ba00e4"])
            widthStops.push([id, 2])
          })

          const colorStyle = {
            property: "id",
            default: "white",
            type: "categorical",
            stops: colorStops
          }

          const widthStyle = {
            property: "id",
            default: 0.1,
            type: "categorical",
            stops: widthStops
          }

          this.map.setPaintProperty(
            "geographyLine",
            "line-color",
            colorStyle
          )
          this.map.setPaintProperty(
            "geographyLine",
            "line-width",
            widthStyle
          )
        }
        else {
          this.map.setPaintProperty(
            "geographyLine",
            "line-color",
            "white"
          )
        }
      },
      setMapHover() {
        const map = this.map
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
          })

        map.on("mousemove", "geographyFill", e => {
          let features = e.features

          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = 'pointer'

          const geographyName = this.layerOptions.name
          const id = e.features[0].properties.id
          const val = formatNumber(this.cardData.map[id][this.years[this.yearIndex]], this.dataConfig)

          popup
            .setLngLat(map.unproject(e.point))
            .setHTML(`<div style="text-align: center;"><strong>${geographyName} ${id}</strong><br/>${val}</div>`)
            .addTo(map)
        })

        map.on("mouseleave", "geographyFill", e => {
          map.getCanvas().style.cursor = ""
          popup.remove()
        })
      },
      setMapClick() {
        this.map.on('click', 'geographyFill', e => {
          const id = e.features[0].properties.id
          this.$store.commit('toggleSelected', {geography: this.geojsonName, id: id})
        })
      },
      toggleBackgroundLayers(size = 'large') {
        const layers = this.map.getStyle().layers
        layers.forEach(layer => {
          if (layer.id !== 'geographyFill' && layer.id !== 'geographyLine') {
            this.map.setLayoutProperty(
              layer.id,
              'visibility',
              size === 'large' ? 'visible': 'none'
            )
          }
        })
      },
      initHiddenBackground(style) {
        style.layers.forEach(layer => {
          if (layer.layout) layer.layout["visibility"] = 'none'
        })
        return style
      },
      updateHighlight(e) {
        this.$emit('updateHighlight', e)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .mapcontainer {
    position: relative;
  }

  .small .map {
    height: 257px;
  }

  .large .map {
    border-bottom: 1px solid #ccc;
    height: 380px;
  }
</style>