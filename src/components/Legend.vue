<template>
  <section class="maplegend">    
    <table>      
      <tr v-for="(color, idx) in legendColor" :key="color">
        <td class="circle">
          <svg width="12" height="12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
            @mouseover="setHighlight(idx)" 
            @mouseout="clearHighlight()"
            @click="setSelected()"
          >
            <circle cx="50" cy="50" r="50" :fill="color" />
          </svg>
        </td>
        <td class="hoverbreaks">
          <span v-if="idx === 0">&gt;</span>{{ prettyNumber(legendBreaks[idx][0]) }} 
        </td>
      </tr>            
    </table>
    
  </section>
</template>

<script>
  import { formatShortNumber, formatNumber } from '../js/numberFormatting'
  import dataToYears from '../js/dataToYears'

  export default {
    name: 'maplegend',
    props: {
      breaks: {
        type: Array
      },
      dataConfig: {
        type: Object
      },
      cardData: {
        type: Object
      },
      yearIndex: {
        type: Number
      }
    },
    computed: {
      dataOptions() {
        return this.$store.state.dataOptions
      },
      mapColors() {
        return this.dataOptions.colors[this.dataConfig.colors] || this.dataOptions.colors['default']
      },
      legendColor() {
        return this.mapColors.slice(0).reverse()
      },
      legendBreaks() {
        return this.breaks.slice(0).reverse()
      },
      geojson() {
        return this.dataConfig.geojson || this.dataOptions.defaultgeojson
      }
    },
    methods: {
      prettyNumber(val) {
        return formatShortNumber(val, this.dataConfig)
      },
      setHighlight(idx) {
        const keys = Object.keys(this.cardData.map)
        const years = dataToYears(this.cardData)
        const year = years[this.yearIndex]
        const highlight = []

        keys.forEach(key => {
          const val = this.cardData.map[key][year]
          if (!isNaN(parseFloat(val))) {
            if (val <= this.legendBreaks[idx][1] && val >= this.legendBreaks[idx][0]) {
              highlight.push(key)
            }
          }
        })
      
        //this.$parent.highlight = highlight
        this.$emit('updateHighlight', highlight)
      },
      clearHighlight() {
        //this.$parent.highlight = []
        this.$emit('updateHighlight', [])
      },
      setSelected() {
        if (this.$store.state.displayMode === 'embed') return
        this.$store.commit("setSelected", { geography: this.geojson, selected: this.$parent.highlight })
      }
    },
  }
</script>

<style scoped>

.maplegend {
  position: absolute;
  top: 10px;
  right: 0;
  transition: 150ms all ease-in-out;
  border-radius: 5px 0 0 5px;
  background-color: white;
}

.maplegend table {
  width: auto;
}

.maplegend tr {
  cursor: pointer;
}

.maplegend td {
  font-size: 0.7em;
  text-align: left;
  vertical-align: top;
}

.maplegend td.circle {
  padding: 2px 3px 0 0;
}
.maplegend td.circle:hover + span {
  display: inline-block;
}
.maplegend hoverBreaks {
  display: none;
}
</style>