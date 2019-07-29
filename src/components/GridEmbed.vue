<template>
  <MetricCard
    class="grid-item"
    :metricId="metric[0]"
    :cardSize="size"
    :class="[size]"
  />
</template>

<script>
  import MetricCard from './Card.vue'

  export default {
    name: 'layout',
    components: {
      MetricCard
    },
    computed: {
      dragOptions() {
        return {
          animation: 300,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      },
      size() {
        return window.innerHeight > 750 ? 'large': 'small'
      },
      metric: {
        get() {
            return this.$store.state.metric
        },
        set(value) {
          this.$store.commit('setMetric', value)
        }
      }
    }

  }
</script>

<style lang="scss">


.grid-item {
  // height: 400px;
  border-radius: 2px;
  background: #fff;
  box-sizing: border-box;
  overflow: auto;
  overflow-x: hidden;
}

.grid-item:first-child {
  height: inherit;
  grid-column: 1 / 3;
  grid-row:  1 / 3;
}

.embed .grid-item:first-child {
  height: 99vh !important;
}



</style>