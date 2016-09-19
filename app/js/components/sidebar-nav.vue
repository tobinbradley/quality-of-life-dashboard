<template lang="html">
    <nav class="data-sidenav demo-navigation mdl-navigation mdl-color--blue-grey-900">
        <template v-if="privateState.filterVal">
            <a class="mdl-navigation__link" v-on:click="changeFilter(null)" href="javascript:void(0)"><i class="mdl-color-text--blue-grey-400 material-icons navleft" role="presentation">chevron_left</i>Back</a>
            <template  v-for="metric in privateState.data | filterMetrics privateState.filterVal">
                <a class="mdl-navigation__link" v-on:click="changeMetric(metric.metric)" href="javascript:void(0)">{{metric.title}}</a>
            </template>
        </template>
        <template v-if="!privateState.filterVal" v-for="category in privateState.data | filterCategories">
            <a class="mdl-navigation__link" v-on:click="changeFilter(category)" href="javascript:void(0)">{{category}}<i class="mdl-color-text--blue-grey-400 material-icons navright" role="presentation">chevron_right</i></a>
        </template>

        <!-- you can put stuff on the bottom of the sidebar here -->
        <!--
        <div class="mdl-layout-spacer"></div>
        <a class="mdl-navigation__link" href="http://qol.charmeck.org/"><i class="mdl-color-text--blue-grey-400 material-icons" role="presentation">help_outline</i>Help</a>
        -->
    </nav>
</template>

<script>
import axios from 'axios';
import fetchData from '../modules/fetch';

export default {
    name: 'sc-sidenav',
    methods: {
        changeFilter: function(filter) {
            this.privateState.filterVal = filter;
        },
        changeMetric: function(metric) {
            // hide floating sidebar on metric change
            let drawer = document.querySelector('.mdl-layout__drawer');
            if (drawer) {
                drawer.classList.remove('is-visible');
                document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');
            }

            if (this.sharedState.metricId !== metric) {
                // push state
                window.history.replaceState(null, null, `./?m=${metric}&s=${this.sharedState.selected.join(',')}`);

                // push analytics
                if (window.ga) {
                    ga('send', 'event', 'metric', this.privateState.data[`m${metric}`].title.trim(), this.privateState.data[`m${metric}`].category.trim());
                }

                // get data
                fetchData(this.sharedState, metric);
            }
        }
    },
    filters: {
        filterCategories: function(value) {
            let categories = [];
            for (let key in value) {
                if (categories.indexOf(value[key].category) === -1) { categories.push(value[key].category); }
            }
            return categories;
        },
        filterMetrics: function(value, filter) {
            let metrics = [];
            for (let key in value) {
                if (value[key].category === filter) { metrics.push({title: value[key].title, metric: value[key].metric}); }
            }
            return metrics;
        }
    }
};
</script>

<style lang="css">
.data-sidenav {
    .mdl-navigation__link {
        padding: 8px 20px !important;
    }
    .navright {
        padding: 0;
        margin-right: 20px !important;
        position: absolute;
        right: 0;
    }
}
</style>
