<template lang="html">
    <div v-if="sharedState.metadata" id="metadata">
        <div class="mdl-grid">
            <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col meta">
                <h3>Why This is Important</h3>
                <div v-html="important(sharedState.metadata)"></div>
                <h4>Additional Resources</h4>
                <div v-html="resources(sharedState.metadata)"></div>
            </div>
            <div class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-grid mdl-grid--no-spacing meta-side">
                <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop meta">
                    <h3>About the Data</h3>
                    <div v-html="about(sharedState.metadata)"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
//import axios from 'axios';
import scrollTo from '../modules/scrollto';
import {metaAbout, metaImportant, metaResources} from '../modules/meta.js';
import fetchData from '../modules/fetch.js';

export default {
    name: 'sc-metadata',
    watch: {
      'privateState.model.metricId': 'fetch'
    },
    methods: {
        important: function(data) {
            return metaImportant(data);
        },
        about: function(data) {
            return metaAbout(data);
        },
        resources: function(data) {
            return metaResources(data);
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
#metadata .meta h3 {
    font-size: 2em;
}
#metadata .meta h4 {
    font-size: 1.5em;
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
</style>
