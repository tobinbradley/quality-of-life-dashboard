<template lang="html">
    <div id="geography-switcher" v-if="geographies" class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
        Choose a geography:
        <p>
        <template v-for="geography in geographies">
            <button type="button" v-bind:class="['mdl-chip', geography.id === sharedState.geographyId ? 'is-active' : '']" v-on:click="changeGeography(geography.id)">
                <span class="mdl-chip__text">{{geography.name}}</span>
            </button>
        </template>
        </p>
    </div>
</template>

<script>
import fetchData from '../modules/fetch';
import {gaEvent} from '../modules/tracking';

export default {
  name: 'sc-geography-switcher',
  methods: {
    changeGeography: function(id) {
      fetchData(this.sharedState, null, id);
      gaEvent('geography', this.privateState.geographies.find((g) => (g.id === id)).name);
    },
  },
  computed: {
    geographies: function() {
      return this.privateState.geographies.filter((g) => (this.privateState.data[`m${this.sharedState.metricId}`].geographies.indexOf(g.id) > -1));
    }
  }
}

</script>

<style scoped>
    .mdl-chip {
        margin: 2px;
        cursor: pointer;
    }
    .mdl-chip.is-active {
        background: #ff4081;
        color: white;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    }
</style>