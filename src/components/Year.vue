<template>
  <section>
     <v-slider
        v-model="yearIndex"
        class="align-center yearslider"
        :class="{singleYear : years.length === 1}"
        :max="max"
        :min="min"
        hide-details
        ticks
        tick-size="4"
      >
        <template v-slot:append>
          <span style="white-space: nowrap">
          {{ displayYear }}
          </span>
        </template>
      </v-slider>
  </section>
</template>

<script>
import dataToYears from '../js/dataToYears'

  export default {
    name: "yearslider",
    data() {
      return {
        min: 0,
        yearIndex: this.$parent.$parent.yearIndex
      }
    },
    props: {
      metricId: String,
      cardData: {
        type: Object
      }
    },
    computed: {
      max() {
        return this.years.length - 1
      },
      displayYear() {
        return this.years[this.yearIndex].replace('y_', '')
      },
      years() {
        return dataToYears(this.cardData)
      },
      dataConfig() {
        return this.$store.getters.dataConfig(this.metricId)
      }
    },
    watch: {
      yearIndex(newValue, oldValue) {
        this.$emit('updateYear', newValue)
      }
    }
  }
</script>

<style lang="scss" scoped>
.yearslider {
  padding: 0 10px;
}
</style>

<style lang="scss">
.singleYear .v-input__control {
  visibility: hidden;
}
</style>