<template>
  <v-app :class="displayMode">
    <AppBar />
    <MetricSelectorToggle />
    <MetricGrid />
    <Footer />
  </v-app>
</template>

<script>
  import MetricGrid from './components/Grid.vue'
  import MetricSelectorToggle from './components/MetricSelectorToggle'
  import AppBar from './components/AppBar.vue'
  import Footer from './components/Footer.vue'

  export default {
    name: 'app',
    components: {
      MetricGrid,
      AppBar,
      Footer,
      MetricSelectorToggle
    },
    computed: {
      displayMode() {
        return this.$store.state.displayMode
      },
      site() {
        return this.$store.state.siteConfig
      }
    },
    beforeMount () {
      // handle pop state
      window.addEventListener('popstate', (event) => {
        if (history.state && history.state.metric && history.state.selected) {
          this.$store.commit('popState', history.state)
        }
      }, false)

      // push initial state
      history.replaceState(
        {
          metric: this.$store.state.metric,
          selected: this.$store.state.selected
        },
        this.site.title,
        window.location.href
      )
    }
  }
</script>

<style lang="scss" scoped>

</style>