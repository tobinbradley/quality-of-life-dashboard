<template lang="html">
    <template v-if="sharedState.metadata">
        <div class="mdl-grid">
            <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col meta">
                <h3>Why This is Important</h3>
                {{{ sharedState.metadata | important }}}
                <h4>Additional Resources</h4>
                {{{ sharedState.metadata | resources }}}
            </div>
            <div class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-grid mdl-grid--no-spacing meta-side">
                <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop meta">
                    <h3>About the Data</h3>
                    {{{ sharedState.metadata | about }}}
                </div>
            </div>
        </div>
    </template>
</template>

<script>
import axios from 'axios';
import {metaDescription, metaAbout, metaImportant, metaResources} from '../modules/meta.js';

export default {
    name: 'sc-metadata',
    filters: {
        description: function(data) {
            return metaDescription(data);
        },
        important: function(data) {
            return metaImportant(data);
        },
        about: function(data) {
            return metaAbout(data);
        },
        resources: function(data) {
            return metaResources(data);
        }
    }
};
</script>

<style lang="css">
    .meta {
        padding: 0 20px 20px;
        h3 {
            font-size: 2em;
        }
        h4 {
            font-size: 1.5em;
        }
        table {
            width: 100%;
            white-space: normal;
        }
        table:first-of-type {
            margin-bottom: 15px;
        }
    }
    .meta-side {
        align-items: flex-start;
        align-content: flex-start;
    }
</style>
