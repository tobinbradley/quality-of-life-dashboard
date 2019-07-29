<template>
<div>
  <v-app-bar dark color="primary">
    <v-app-bar-nav-icon @click.stop="linksDrawer = !linksDrawer"></v-app-bar-nav-icon>

    <v-toolbar-title>
      {{ site.title }}
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-btn icon @click="togglePrint()">
      <v-icon>{{ mdiPrinter }}</v-icon>
    </v-btn>
        
  </v-app-bar>

  <NavLinks />

</div>
</template>

<script>
  import MetricSelector from './MetricSelector.vue'
  import NavLinks from './NavLinks.vue'
  import { mdiPlus, mdiPrinter, mdiFinance } from '@mdi/js'
  import setMode from '../js/displayMode'

  export default {
    name: 'appbar',
    components: {
      MetricSelector,
      NavLinks
    },
    data () {
      return {
        linksDrawer: null,
        metricsDrawer: null,
        mdiPlus: mdiPlus,
        mdiPrinter: mdiPrinter,
        mdiFinance: mdiFinance
      }
    },
    computed: {
      site() {
        return this.$store.state.siteConfig 
      }
    },
    methods: {
      togglePrint() {
        if (this.$store.state.displayMode !== 'print') {
          this.$store.commit("setDisplayMode", setMode('print'))
        }
        else {
          this.$store.commit("setDisplayMode", setMode())
        }
      }
    }
  }
</script>

<style scoped>

</style>