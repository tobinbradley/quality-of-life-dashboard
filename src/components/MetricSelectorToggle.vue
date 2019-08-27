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
      :class="['no-print', iFramed ? 'iFramed': 'notIframed']"
      aria-label="Add Data" title="Add Data"
    >
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>

    <MetricSelector v-model="showMetricSelector" />
  </div>
</template>

<script>
  import MetricSelector from './MetricSelector.vue'
  import { mdiPlus } from '@mdi/js'

  export default {
    name: 'metricToggle',
    data () {
      return {
        mdiPlus: mdiPlus,
        showMetricSelector: false
      }
    },
    computed: {
      iFramed() {
        return this.$store.state.iFramed
      }
    },
    components: {
      MetricSelector
    }
  }
</script>

<style lang="scss" scoped>
.notIframed {
  top: 73px !important;
  right: 10px;
}
.iFramed {
  top: 10px !important;
  right: 10px;
}
</style>