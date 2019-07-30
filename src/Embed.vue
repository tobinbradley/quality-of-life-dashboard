<template>
  <v-app class="embed">
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
    beforeMount () {
      // set display mode to embed
      this.$store.commit('setDisplayMode', 'embed')
    }
  }
</script>

<style lang="css">
.theme--light.v-application {
  background: transparent;
}
</style>
