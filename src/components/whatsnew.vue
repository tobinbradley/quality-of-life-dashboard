<template>
<div v-if="whatsnew && whatsnew.length > 0" class="mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet whatsnew">
    <div class="">
        <h1 class="mdl-typography--text-center">What's New</h1>
        <span v-for="m, index in whatsnew" class="mdl-chip mdl-color--teal mdl-color-text--white">
            <span class="mdl-chip__text" v-on:click="changeMetric(m)">{{ data[`m${m}`].title }}</span>
        </span>
    </div>
</div>
</template>

<script>
import {replaceState, gaEvent} from '../modules/tracking';
import fetchData from '../modules/fetch';
import scrollTo from "../modules/scrollto";

export default {
  name: 'Whatsnew',
  methods: {
    changeMetric: function(metric) {
      if (this.sharedState.metricId !== metric) {
        replaceState(metric, this.sharedState.selected);
        gaEvent('metric', this.data[`m${metric}`].title.trim(), this.data[`m${metric}`].category.trim());
        fetchData(this.sharedState, metric);
        scrollTo(document.querySelector(".mdl-layout__content"), 0, 600);
      }
    }
  }
}
</script>