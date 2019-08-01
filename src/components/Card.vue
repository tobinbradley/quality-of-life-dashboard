<template>
  <v-card ref="card" class="card-container">

    <v-card-title class="handle">
      <v-icon>{{ mdiDrag }}</v-icon>
      <div class="overline">{{ dataConfig.title }}</div>
    </v-card-title>

    <!-- main content -->
    <v-card-text class="card-text">
      <template v-if="cardData && geometry">

        <div v-show="show === 'Map' || cardSize === 'large'">
          <Map :geocode="geocode" :geojson="geometry" :cardSize="cardSize" :cardData="cardData" :highlight="highlight" :metricId="metricId" :yearIndex="yearIndex" @updateHighlight="updateHighlight" />
          <Year class="years" :cardData="cardData" :metricId="metricId" @updateYear="updateYear" />
        </div>

        <template v-if="cardSize === 'large'">
          <div v-if="dataConfig.subtitle" class="overline" style="text-align: center">{{ dataConfig.subtitle }}</div>

          <!-- <div class="flexgrid"> -->
          <v-layout wrap class="large-2x2" style="margin: 20px 10px;">
            <v-flex custom-sm5>
              <Numbers class="numbers" :cardData="cardData" :metricId="metricId" :yearIndex="yearIndex" />
            </v-flex>
            <v-flex custom-sm6>
              <TrendChart class="trendchart" :cardData="cardData" :metricId="metricId" :yearIndex="yearIndex"  />
            </v-flex>
          </v-layout>
          <!-- </div> -->

          <DataTable v-if="showTable" :cardData="cardData" :highlight="highlight" :metricId="metricId" :yearIndex="yearIndex" @updateHighlight="updateHighlight" />
        </template>

        <template v-if="cardSize === 'small'">
          <TrendChart class="trendchart" v-if="show === 'TrendChart'" :cardData="cardData" :metricId="metricId" :yearIndex="yearIndex" />
          <Numbers class="numbers" v-if="show === 'Numbers'" :cardData="cardData" :metricId="metricId" :yearIndex="yearIndex" />
          <DataTable v-if="show === 'DataTable'" :highlight="highlight" :cardData="cardData" :metricId="metricId" :yearIndex="yearIndex" />
        </template>

      </template>
    </v-card-text>


    <!-- card control area -->
    <v-card-actions class="card-actions">

      <v-btn-toggle v-model="toggleToolbar" mandatory v-show="cardSize === 'small'">
        <v-btn small>
          <v-icon>{{ mdiMap }}</v-icon>
        </v-btn>
        <v-btn small title="Trend Chart">
          <v-icon>{{ mdiChartLine }}</v-icon>
        </v-btn>
        <v-btn small>
          <v-icon>{{ mdiNumeric }}</v-icon>
        </v-btn>
        <v-btn small>
          <v-icon>{{ mdiTableLarge }}</v-icon>
        </v-btn>
      </v-btn-toggle>

      <template v-if="cardSize === 'large'">
        <Search v-if="displayMode !== 'embed'" :metricId="metricId" :geometry="geometry" @geocode="setGeocode" />

          <v-btn-toggle>
          <v-btn small @click="showTable = !showTable">
            <v-icon>{{ mdiTableLarge }}</v-icon>
          </v-btn>
        </v-btn-toggle>
      </template>

      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text small v-on="on">
            <v-icon>{{ mdiMenu }}</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item link @click="getCSVData()">
            <v-list-item-title>Download as CSV</v-list-item-title>
          </v-list-item>
          <v-list-item link :disabled="selected.length === 0" @click="getCSVData(selected)">
            <v-list-item-title>Download Selected as CSV</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="getGeoJSONData()">
            <v-list-item-title>Download as GeoJSON</v-list-item-title>
          </v-list-item>
          <v-list-item link :disabled="selected.length === 0" @click="getGeoJSONData(selected)">
            <v-list-item-title>Download Selected as GeoJSON</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="showMeta=true">
            <v-list-item-title>View Metadata</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="showEmbed=true">
            <v-list-item-title>Embed</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn v-if="displayMode !== 'embed'" small text color="primary" @click="remove">
        <v-icon>{{mdiClose}}</v-icon>
      </v-btn>

    </v-card-actions>

    <Meta v-model="showMeta" :dataConfig="dataConfig" />
    <Embed v-model="showEmbed" :dataConfig="dataConfig" />
  </v-card>

</template>

<script>
  import { mdiDrag, mdiMenu, mdiMap, mdiChartLine, mdiTableLarge, mdiCloseBoxOutline, mdiNumeric } from '@mdi/js'
  import download from '../js/download'
  import dataToYears from '../js/dataToYears'
  import { formatNumber } from '../js/numberFormatting'
  import Map from './Map'
  import TrendChart from './TrendChart'
  import DataTable from './Table'
  import Numbers from './Numbers'
  import Meta from './Meta'
  import Embed from './EmbedCode'
  import Year from './Year'
  import Search from './Search'

  export default {
    name: 'card',
    components: {
      Map,
      Year,
      Numbers,
      TrendChart,
      DataTable,
      Meta,
      Embed,
      Search
    },
    props: {
      metricId: {
        type: String
      },
      cardSize: {
        type: String
      }
    },
    data: () => ({
      mdiDrag: mdiDrag,
      mdiMenu: mdiMenu,
      mdiChartLine: mdiChartLine,
      mdiMap: mdiMap,
      mdiTableLarge: mdiTableLarge,
      mdiNumeric: mdiNumeric,
      mdiClose: mdiCloseBoxOutline,
      cardData: null,
      yearIndex: null,
      geometry: null,
      geocode: null,
      toggleToolbar: 0,
      highlight: [],
      toolbar: ["Map", "TrendChart", "Numbers", "DataTable"],
      showMeta: false,
      showEmbed: false,
      showTable: false
    }),
    computed: {
      displayMode() {
        return this.$store.state.displayMode
      },
      metric() {
        return this.$store.state.metric
      },
      dataConfig() {
        return this.$store.getters.dataConfig(this.metricId)
      },
      dataOptions() {
        return this.$store.state.dataOptions
      },
      geojson() {
        return this.$store.getters.geojsonName(this.metricId)
      },
      layerOptions() {
        return this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojson })[0]
      },
      selected() {
        return this.$store.getters.selected(this.geojson)
      },
      show() {
        return this.toolbar[this.toggleToolbar]
      }
    },
    mounted () {
      // fix for weird Chrome ghost position bug on drag
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      if (isChrome && this.$refs.card.$el) {
        this.$refs.card.$el.addEventListener('dragstart', event => {
            event.dataTransfer.setDragImage(this.$refs.card.$el, -99999, -99999);
        }, false)
      }

      // fetch data
      fetch(`./data/metric/m${this.metricId}.json`)
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          const years = dataToYears(json)
          this.yearIndex = years.length - 1
          this.cardData = json
        })

      // fetch geojson
      fetch(`./data/geojson/${this.geojson}`)
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          this.geometry = json
        })
    },
    methods: {
      remove() {
        const newMetric = this.$store.state.metric
        newMetric.splice(newMetric.indexOf(this.index), 1)
        this.$store.commit('setMetric', newMetric)
      },
      setSize() {
        if (this.$refs.card.offsetWidth >= 500) {
          return 'large'
        }
        return 'small'
      },
      updateHighlight(e) {
        this.highlight = e
      },
      updateYear(e) {
        this.yearIndex = e
      },
      setGeocode(val) {
        this.geocode = val
      },
      getCSVData(keys = Object.keys(this.cardData.map)) {
        const headerArray = []
        const years = dataToYears(this.cardData)

        headerArray.push(this.layerOptions.name)
        headerArray.push(...years.map(elem => { return elem.replace('y_', '')}))

        const header = headerArray.join(',') + '\n'

        let body = ''

        keys.forEach(key => {
          const row = [key]
          years.forEach(year=> {
            row.push(formatNumber(this.cardData.map[key][year], this.dataConfig))
          })
          body += row.join(',') + '\n'
        })

        download(header + body, 'data:text/csv;charset=utf-8;', `${this.dataConfig.title}.csv`)
      },
      getGeoJSONData(keys = Object.keys(this.cardData.map)) {
        const years = dataToYears(this.cardData)
        const geojson = JSON.parse(JSON.stringify(this.geometry))
        const features = geojson.features.filter(elem => { return keys.indexOf(elem.properties.id) !== -1 })

        geojson.features = features

        geojson.features.forEach(elem => {
          years.forEach(year => {
            elem.properties[year] = this.cardData.map[elem.properties.id][year]
          })
        })

        download(JSON.stringify(geojson), 'data:text/json;charset=utf-8;', `${this.dataConfig.title}.geojson`)
      }
    }
  }
</script>

<style lang="scss" scoped>
// drag handle
.handle:hover {
  cursor: move;
}

.embed .handle:hover {
  cursor: auto;
}

// scrollable card text area
.card-container {
  display: flex;
  flex-direction: column;
}
.card-text {
  flex: 1;
  overflow: auto;
  overflow-x: hidden;
}
.card-actions {
  justify-content: flex-end;
  align-content: center;
  display: flex;
}

.embed .card-container {
  margin: 2px 2px 0;
}

@media (min-width: 500px) {
  .flex.custom-sm5 {
      -ms-flex-preferred-size: 41.6666666667%;
      flex-basis: 41.6666666667%;
      -webkit-box-flex: 0;
      -ms-flex-positive: 0;
      flex-grow: 0;
      max-width: 41.6666666667%;
  }
  .flex.custom-sm6 {
      -ms-flex-preferred-size: 50%;
      flex-basis: 50%;
      -webkit-box-flex: 0;
      -ms-flex-positive: 0;
      flex-grow: 0;
      max-width: 50%;
      margin-left: 8.3333333333%;
  }
}

</style>
