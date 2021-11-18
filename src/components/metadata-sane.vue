<template lang="html">
    <div v-if="sharedState.metadata" id="metadata">
        <div class="mdl-grid">
            <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col meta" v-html="formatMeta(sharedState.metadata)">

            </div>
        </div>
    </div>
</template>

<script>
import scrollTo from '../modules/scrollto';
import fetchData from '../modules/fetch.js';

export default {
    name: 'sc-metadata',
    watch: {
      'privateState.model.metricId': 'fetch'
    },
    methods: {
        formatMeta: function(data) {
          return data.replace(/\<table/g, '<table class="mdl-data-table mdl-js-data-table meta-table"')
        },
        fetch: function() {
            fetchData(this.sharedState, this.privateState.model.metricId.replace('m', ''));
            scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
        }
    }
};
</script>

<style lang="css">
#metadata .meta {
  padding: 0 20px 20px;
}
#metadata .meta h2 {
  font-size: 2em;
  margin: 20px 0 0;
}
#metadata .meta h3 {
  font-size: 1.8em;
  margin: 10px 0 0;
}
#metadata .meta h4 {
  font-size: 1.4em;
  margin: 10px 0 0;
}
#metadata .meta-side {
  align-items: flex-start;
  align-content: flex-start;
}
#metadata table {
  width: 100%;
  white-space: normal;
}
#metadata table:first-of-type {
  margin-bottom: 15px;
}
#metadata table td {
  text-align: left;
}
</style>
