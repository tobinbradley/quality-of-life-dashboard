<template>

  <v-footer  class="font-weight-medium app-footer">
    <v-flex
      text-center
      xs12
    >
    <p>
      <img src="../assets/seals.png" height="36" alt="City and County Seals">
    </p>
      Created by <a href="http://charmeck.org/mecklenburg/county/Pages/Default.aspx">Mecklenburg County</a>, the <a href="http://charmeck.org/city/charlotte/Pages/default.aspx">City of Charlotte</a>, and <a href="http://www.uncc.edu/">UNC Charlotte</a>
          with much &#9829; for the projects that make this site possible:
          <br>
          <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>,
          <a href="http://osm2vectortiles.org/" target="_blank">OSM2VectorTiles</a>,
          <a href="https://www.mapbox.com/mapbox-gl-js/api/" target="_blank">Mapbox GL JS</a>,
          <a href="http://vuejs.org/" target="_blank">Vue.js</a>, and
          <a href="https://vuetifyjs.com/" target="_blank">Vuetify</a>.
    </v-flex>
  </v-footer>

</template>

<script>
  export default {
    name: 'foot'
  }
</script>

<style lang="css">
.app-footer {
  margin-top: 40px;
  background-color: transparent !important;
}
</style>