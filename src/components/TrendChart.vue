<template>
  <section>
    <canvas class="trendChart" ref="trendChart" ></canvas>
  </section>
</template>

<script>
  import Chart from 'chart.js'
  import metricCalculation from '../js/metricCalculation'
  import dataToYears from '../js/dataToYears'
  import { formatNumber } from '../js/numberFormatting'

  export default {
    name: "trendchart",
    props: {
      cardData: {
        type: Object
      },
      metricId: {
        type: String
      },
      yearIndex: {
        type: Number
      }
    },
    data() {
      return {
        trendChart: null,
        compareColors: [
          "#3f51b5",
          "#4caf50",
          "#00bcd4",
          "#cddc39"
        ],
        comparables: []
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
      selected() {
        return this.$store.getters.selected(this.geojson)
      },
      chartOptions() {
        return {
          responsive: true,
          preserveAspectRatio: false,
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 7
						}
          },
          title: {
            display: false,
            text: this.dataConfig.subtitle
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
          },
          tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (tooltipItem, data) => {
                return ` ${data.datasets[tooltipItem.datasetIndex].label || ''}: ${formatNumber(tooltipItem.yLabel, this.dataConfig)}`
              }
            }
          }
        }
      }
    },
    watch: {
      selected(newValue, oldValue) {
        // remove selected data if present
        if (this.trendChart.data.datasets[this.trendChart.data.datasets.length - 1].label === "Selected") {
          this.trendChart.data.datasets.pop()
        }

        // push in selected
        if (this.selected.length > 0) this.trendChart.data.datasets.push(this.selectedData())
        this.trendChart.update()
      }
    },
    async mounted () {
      const ctx = this.$refs.trendChart.getContext('2d')

      this.trendChart = new Chart(ctx, {
          type: 'line',
          data: await this.chartData(),
          options: this.chartOptions
      })

    },
    methods: {
      selectedData() {
        const data = {
          label: 'Selected',
          backgroundColor: '#ff9800',
					borderColor: '#ff9800',
          data: [],
          fill: false,
          pointRadius: 3
        }

        this.years.forEach(year => {
          let dataPoint = metricCalculation(this.cardData, year, this.dataConfig.type, this.selected)
          if (isNaN(parseFloat(dataPoint))) dataPoint = null
          data.data.push(dataPoint)
        })

        return data
      },
      async chartData() {
        const data = {
          labels: this.years.map(elem => { return elem.replace('y_', '')}),
          datasets: []
        }

        // push in comparables
        const compareData = await this.compareData()
        data.datasets.push(...compareData)

        // push in selected
        if (this.selected.length > 0) data.datasets.push(this.selectedData())

        return data
      },
      async compareData() {
        // loop through calculated ones
        const calcComparables = this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojson })[0]

        const returnArray = []

        let idx = 0
        for await (const group of calcComparables.compareGroups) {
          const data = {
            label: group.name,
            backgroundColor: this.compareColors[idx],
            borderColor: this.compareColors[idx],
            data: [],
            fill: false,
            pointRadius: 3
          }

          let ids = false
          if (group.ids) {
            const response = await fetch(group.ids)
            ids = await response.json()
            if (group.format) ids = group.format(ids)
          }

          this.years.forEach(year => {
            let dataPoint = null
            // set world value
            if (!ids && this.dataConfig.world_val && this.dataConfig.world_val[year]) {
              dataPoint = this.dataConfig.world_val[year]
            } else {
              dataPoint = metricCalculation(this.cardData, year, this.dataConfig.type, ids || false)
              if (isNaN(parseFloat(dataPoint))) dataPoint = null
            }

            data.data.push(dataPoint)
          })

          this.comparables = data

          returnArray.push(data)

          idx++
        }

        return returnArray
      }
    }
  }
</script>

<style scoped>
section {
  position: relative;
  width: 100%;
}
.small section {
  margin-top: 30px;
  min-height: 148px;
}
.large section {
  min-height: 218px;
}

@media (max-width: 600px) {
  section {
    margin-top: 30px;
  }
}
</style>