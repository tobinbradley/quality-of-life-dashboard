<template>
  <v-app :class="displayMode">
    <EmbedGrid />
  </v-app>
</template>

<script>
  import EmbedGrid from './components/GridEmbed.vue'

  export default {
    name: 'app',
    components: {
      EmbedGrid
    },
    computed: {
      displayMode() {
        return this.$store.state.displayMode
      }
    },
    beforeMount () {
      // set display mode
      this.$store.commit('setDisplayMode', 'embed')
    }
  }
</script>

<style lang="css">
.theme--light.v-application {
  background: transparent;
}
</style>
