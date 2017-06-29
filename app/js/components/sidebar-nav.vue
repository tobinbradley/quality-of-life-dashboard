<template lang="html">
    <nav class="demo-navigation mdl-navigation mdl-color--blue-grey-900">
        <template v-if="privateState.filterVal">
            <a class="mdl-navigation__link" v-on:click="changeFilter(null)" href="javascript:void(0)"><i class="mdl-color-text--blue-grey-400 material-icons navleft" role="presentation">chevron_left</i>Back</a>
            <template  v-for="m in filterMetrics(privateState.data, privateState.filterVal)">
                <a class="mdl-navigation__link mdl-navigation__link-end" v-on:click="changeMetric(m.metric)" href="javascript:void(0)">{{m.title}}</a>
            </template>
        </template>
        <template v-else >
            <span class="sidebar-title">Explore the Data</span>
            <template v-for="category in filterCategories(privateState.data)">
                <a class="mdl-navigation__link" v-on:click="changeFilter(category)" href="javascript:void(0)">{{category}}<i class="mdl-color-text--blue-grey-400 material-icons navright" role="presentation">chevron_right</i></a>
            </template>
            <a class="mdl-navigation__link" href="http://qol.charmeck.org/">About</a>
            <a class="mdl-navigation__link" href="downloads/qol-data.zip">Download Data</a>
        </template>
        
        <!--<div class="mdl-layout-spacer"></div>
        <div style="text-align: center">
            <a class="mdl-navigation__link-bottom" href="http://qol.charmeck.org/">About</a> &bull; <a class="mdl-navigation__link-bottom" href="downloads/qol-data.zip">Download Data</a>
        </div>-->
    </nav>
</template>

<script>
import axios from 'axios';
import fetchData from '../modules/fetch';
import {replaceState, gaEvent} from '../modules/tracking';

export default {
    name: 'sc-sidenav',
    methods: {
        changeFilter: function(filter) {
            this.privateState.filterVal = filter;
        },
        hideOverlay: function() {
            // hide floating sidebar on metric change
            let drawer = document.querySelector('.mdl-layout__drawer');
            if (drawer) {
                drawer.classList.remove('is-visible');
                document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');
            }
        },
        changeMetric: function(metric) {
            this.hideOverlay();
            if (this.sharedState.metricId !== metric) {
                replaceState(metric, this.sharedState.selected);
                gaEvent('metric', this.privateState.data[`m${metric}`].title.trim(), this.privateState.data[`m${metric}`].category.trim());
                fetchData(this.sharedState, metric);
            }
        },
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

<style lang="css" scoped>
.mdl-navigation__link {
    padding: 5px 20px !important;
}
.mdl-navigation__link-end {
    line-height: 1.3em;
    padding: 8px 20px !important;
}
.mdl-navigation__link-bottom {
    color: hsla(0,0%,100%,.75);
    text-decoration: none;
    display: inline;
    font-size: 0.9em;
}
.navright {
    padding: 0;
    margin-right: 15px !important;
    position: absolute;
    right: 0;
}
.sidebar-title {
    padding: 0 20px 8px;
}
</style>

<style lang="css">
.mdl-navigation__link-bottom {
    color: hsla(0,0%,100%,.75);
    text-decoration: none;
    display: inline;
}
</style>
