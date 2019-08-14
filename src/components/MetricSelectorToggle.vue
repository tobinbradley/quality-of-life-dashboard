<template>
  <div>
   <v-btn
      color="pink"
      dark
      absolute
      top
      right
      fab
      @click="showMetricSelector=true"
      style="top: 73px; right: 10px;"
      class="no-print"
      aria-label="Add Data" title="Add Data"
    >
      <v-icon>{{ mdiFinance }}</v-icon>
    </v-btn>

    <MetricSelector v-model="showMetricSelector" />
  </div>
</template>

<script>
  import MetricSelector from './MetricSelector.vue'
  import { mdiFinance } from '@mdi/js'

  export default {
    name: 'metricToggle',
    data () {
      return {
        mdiFinance: mdiFinance,
        showMetricSelector: false
      }
    },
    components: {
      MetricSelector
    }
  }
</script>

<style lang="scss" scoped>

</style>