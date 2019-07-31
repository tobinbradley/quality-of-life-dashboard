<template>
  <section>
    <p class="numbers">
      <span class="selected">
        {{ metric }}
      </span>
      <span v-if="dataConfig.label" class="label">
        {{ dataConfig.label }}
      </span>
      <span v-if="dataConfig.raw_label" class="raw">
        {{ raw }} {{ dataConfig.raw_label }}
      </span>
    </p>
    <p>
      <v-simple-table dense>
        <thead>
          <tr>
            <th class="text-xs-left" style="text-align: left;">COMPARE TO</th>
            <th class="text-xs-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in comparables" :key="item.name">
            <td class="text-xs-left" style="text-align: left;">
              {{ item.name }}
              <span v-if="item.raw" class="raw">{{ item.raw }} {{ dataConfig.raw_label }}</span>
            </td>
            <td class="text-xs-right" style="text-align: right;">{{ item.val }}</td>
          </tr>
          <tr v-for="item in fixedComparables" :key="item.name" >
            <td class="text-xs-left" style="text-align: left;">{{ item.name }}</td>
            <td class="text-xs-right" style="text-align: right;">{{ item.val }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </p>
  </section>
</template>

<script>
  import metricCalculation from '../js/metricCalculation'
  import dataToYears from '../js/dataToYears'
  import { dataToArray, weightedDataToArray } from '../js/dataToArray'
  import { sum } from 'simple-statistics'
  import { formatNumber } from '../js/numberFormatting'

  export default {
    name: 'numbers',
    props: {
      metricId: String,
      cardData: {
        type: Object
      },
      yearIndex: {
        type: Number
      }
    },
    data() {
      return {
        metric: '--',
        raw: '--',
        comparables: [],
        fixedComparables: []
      }
    },
    computed: {
      years() {
        return dataToYears(this.cardData)
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
      year() {
        return this.years[this.yearIndex]
      },
      selected() {
        return this.$store.state.selected[this.geojson]
      },
    },
    watch: {
      yearIndex(newValue, oldValue) {
        this.setMetricVals()
        this.setCalcComparables()
      },
      selected() {
        this.setMetricVals()
      }
    },
    mounted () {
      this.setMetricVals()
      this.setCalcComparables()
      this.setFixedComparables()
    },
    methods: {
      metricVal(keys = false) {
        return metricCalculation(this.cardData, this.year, this.dataConfig.type, keys)
      },
      rawVal(keys = false) {
        return sum(weightedDataToArray(this.cardData.map, this.cardData.w, this.year, keys))
      },
      setMetricVals() {
        // main metric value
        this.metric = formatNumber(this.metricVal(this.selected), this.dataConfig)
        // raw if needed
        if (this.dataConfig.raw_label) {
          this.raw = formatNumber(this.rawVal(this.selected), this.dataConfig)
        }
      },
      setCalcComparables() {
        this.comparables = []
        // loop through calculated ones
        const calcComparables = this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojson })

        calcComparables[0].compareGroups.forEach(async group => {
          const record = {
            name: group.name
          }

          let ids = false
          if (group.ids) {
            const response = await fetch(group.ids)
            ids = await response.json()
            if (group.format) ids = group.format(ids)
          }

          record.val = formatNumber(this.metricVal(ids || false), this.dataConfig)
          // raw if needed
          if (this.dataConfig.raw_label) {
            record.raw = formatNumber(this.rawVal(ids || false), this.dataConfig)
          }

          this.comparables.push(record)
        })
      },
      setFixedComparables(){
        if (this.dataConfig.comparables) {
          this.dataConfig.comparables.forEach(elem => {
            this.fixedComparables.push({
              name: elem.name,
              val: elem.val
            })
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

.small section {
  padding-top: 25px;
}

.text-tooltip {
  color: #1566b6;
}

.numbers {
  text-align: center;
  text-transform: uppercase;

  span {
    display: block;
  }
  span.subtitle {
    font-size: 0.9em;
    line-height: 1em;
    padding-bottom: 10px;
  }
  span.selected {
    font-size: 3em;
    font-weight: bold;
    line-height: 0.9em;
  }
  span.label {
    font-size: 1.1em;
  }
  span.raw {
    font-size: 0.8em;
    line-height: 1em;
  }
}

table {
  text-transform: inherit;
  .raw {
    display: block;
    font-size: 0.9em;
  }
}
</style>