<template>
  <main>
    <Print v-if="displayMode === 'print'" />

    <draggable
        v-bind="dragOptions"
        v-model="metric"
        handle=".handle"
        @start="drag = true"
        @end="drag = false"
      >
      <transition-group type="transition" :name="!drag ? 'flip-list' : null" class="grid-container">
        <MetricCard
          v-for="(element, idx) in metric"
          class="grid-item"
          :class="{ large: idx === 0 || displayMode === 'print', small: idx > 0}"
          :key="element"
          :metricId="element"
          :cardSize="idx === 0 || displayMode === 'print' ? 'large': 'small'"
        />
      </transition-group>
    </draggable>

  </main>
</template>

<script>
  import draggable from 'vuedraggable'
  import MetricCard from './Card.vue'
  import Print from './Print'

  export default {
    name: 'layout',
    components: {
      draggable,
      MetricCard,
      Print
    },
    data() {
      return {
        drag: false
      }
    },
    computed: {
      dragOptions() {
        return {
          animation: 200,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      },
      metric: {
        get() {
            return this.$store.state.metric
        },
        set(value) {
          this.$store.commit('setMetric', value)
        }
      },
      displayMode() {
        return this.$store.state.displayMode
      }
    }
  }
</script>

<style lang="scss">

.grid-container {
  margin: 25px 10px;
  display: flex;
  flex-wrap: wrap;

  @supports (display: grid) {
    display: grid;
    grid-template-columns:  repeat(auto-fill, 380px);
    grid-template-rows: 400px repeat(auto-fill, 400px);
    grid-gap: 18px;
  }
}

.grid-item {
  flex: 0 0 380px;
  height: 400px;
  border-radius: 2px;
  background: #fff;
  overflow: auto;
  overflow-x: hidden;
  transition: transform 0.3s;
  margin: 0 18px 18px 0;

  @supports (display: grid) {
    margin: 0;
  }
}

.grid-item:first-child {
  flex: 0 0 778px;
  height: 818px;

  @supports (display: grid) {
    height: inherit;
    grid-column: auto / span 2;
    grid-row:  auto / span 2;
  }
}

@media (max-width: 800px) {
  .grid-container {
    display: block;
  }
  .grid-item {
    margin-bottom: 18px;
    overflow: inherit;
    height: 100%;
  }
}

.print {
  .grid-container {
    display: block;
  }
  .grid-item {
    margin-bottom: 18px;
    overflow: inherit;
    min-height: 10in;
    width: 7.8in;
    margin: 10px auto;
  }
}

// draggable transition
.ghost {
  opacity: 0.5;
  background: rgb(200, 235, 251) !important;
}
</style>
