<template>
  <v-app :class="[displayMode, iFramed ? 'iFramed' : '']">
    <AppBar v-if="!iFramed" />
    <MetricSelectorToggle />
    <MetricGrid />
    <Footer v-if="!iFramed" />
    <Splash />
  </v-app>
</template>

<script>
  import MetricGrid from './components/Grid.vue'
  import MetricSelectorToggle from './components/MetricSelectorToggle'
  import AppBar from './components/AppBar.vue'
  import Footer from './components/Footer.vue'
  import Splash from './components/Splash.vue'

  export default {
    name: 'app',
    components: {
      MetricGrid,
      AppBar,
      Footer,
      MetricSelectorToggle,
      Splash
    },
    computed: {
      displayMode() {
        return this.$store.state.displayMode
      },
      site() {
        return this.$store.state.siteConfig
      },
      iFramed() {
        return this.$store.state.iFramed
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

<style lang="scss">
.iFramed.theme--light.v-application {
  background: transparent !important;
}
</style>