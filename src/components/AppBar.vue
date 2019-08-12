<template>
<div>
  <v-app-bar dark color="primary">
    <v-app-bar-nav-icon @click.stop="linksDrawer = !linksDrawer" aria-label="Navigation Links"></v-app-bar-nav-icon>

    <v-toolbar-title>
      {{ site.title }}
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-btn icon @click="togglePrint()" aria-label="Print" title="Print">
      <v-icon>{{ mdiPrinter }}</v-icon>
    </v-btn>
    <v-btn icon v-if="site.helpUrl" @click="showHelp = true" aria-label="Help" title="Help">
      <v-icon>{{ mdiHelp }}</v-icon>
    </v-btn>

    <Help v-model="showHelp" />

  </v-app-bar>
  <NavLinks />
</div>
</template>

<script>
  import NavLinks from './NavLinks.vue'
  import Help from './Help'
  import { mdiPrinter, mdiHelp } from '@mdi/js'

  export default {
    name: 'appbar',
    components: {
      Help,
      NavLinks
    },
    data () {
      return {
        linksDrawer: null,
        metricsDrawer: null,
        mdiPrinter: mdiPrinter,
        mdiHelp: mdiHelp,
        showHelp: false
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
          this.$store.commit("setDisplayMode", 'print')
        }
        else {
          this.$store.commit("setDisplayMode", 'desktop')
        }
      }
    }
  }
</script>

<style scoped>

</style>