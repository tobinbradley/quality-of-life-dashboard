<template>
  <section>
    <v-data-table
      :headers="headers"
      :items="tableData"
      :items-per-page="5"
      dense
      :custom-sort="customSort"
      :mobile-breakpoint="300"
      class="table-data"
    >
      <template v-slot:body="{ items }">
        <tr v-for="item in items" :key="item.name" :class="{ highlight: highlight.indexOf(item.name) !== -1}">
          <td v-for="elem in Object.keys(item)" :key="elem" @mouseenter="setHighlight([item.name])" @mouseleave="setHighlight()">
            {{ item[elem] }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </section>
</template>

<script>
  import dataToYears from '../js/dataToYears'
  import { formatNumber } from '../js/numberFormatting'

  export default {
    name: 'datatable',
    props: {
      cardData: {
        type: Object
      },
      metricId: {
        type: String
      },
      highlight: {
        type: Array
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
      displayMode() {
        return this.$store.state.displayMode
      },
      // tableRows() {
      //   return this.displayMode === 'print' ? 9999 : 5
      // },
      geojson() {
        return this.$store.getters.geojsonName(this.metricId)
      },
      selected() {
        return this.$store.getters.selected(this.geojson)
      },
      layerOptions() {
        return this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojson })[0]
      },
      headers() {
        const colHeaders = [
          {
            text: this.layerOptions.name,
            value: 'name',
            align: 'start'
          }
        ]

        this.years.forEach(year => {
          colHeaders.push({
            text: year.replace('y_', ''),
            value: year,
            align: 'end'
          })
        })

        // optional accuracy
        if (this.dataConfig.accuracy) {
          colHeaders.push({
            text: 'Accuracy',
            value: 'accuracy',
            align: 'end'
          })
        }

        return colHeaders
      },
      tableData() {
        const dataArray = []

        this.selected.forEach(elem => {
          const rec = {
            name: elem
          }
          this.years.forEach(year => {
            rec[year] = formatNumber(this.cardData.map[elem][year], this.dataConfig)
          })
          if (this.dataConfig.accuracy) {
            rec['accuracy'] = '±' + formatNumber(this.cardData.a[elem][this.years[this.years.length - 1]], this.dataConfig)
          }

          dataArray.push(rec)
        })

        return dataArray
      }

    },
    watch: {
      displayMode(newValue, oldValue) {
        newValue === 'print' ? this.tableRows = 9999 : this.tableRows = 10
      }
    },
    methods: {
      setHighlight(keys = []) {
        this.$emit('updateHighlight', keys)
      },
      customSort(items, index, isDescending) {
        if (index.length === 0 || isDescending.length === 0) return items

        items.sort((a, b) => a[index[0]].localeCompare(b[index[0]], 'fr', {numeric: true, ignorePunctuation: true}))
        if (!isDescending[0]) items = items.reverse()
        return items

      }
    }
  }
</script>

<style lang="scss">
.table-data.v-data-table {
  margin-top: 20px;

  tr.highlight {
    background-color: yellow;
  }
  td, th {
    white-space: nowrap;
    text-align: right;
  }
  td:first-of-type,
  th:first-of-type {
    text-align: left;
  }
}
</style>
