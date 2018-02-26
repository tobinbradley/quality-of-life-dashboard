<template lang="html">
    <div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-color--white category-tabs no-print">

      <div class="mdl-tabs mdl-js-tabs">
         <div class="mdl-tabs__tab-bar mdl-typography--text--center">
            <template v-for="category, index in filterCategories(privateState.data)">
              <a v-bind:class="['mdl-tabs__tab', category === privateState.data[`m${sharedState.metricId}`].category ? 'is-active' : '']" v-bind:href="tabId(index, '#')">{{category}}</a>
            </template>
         </div>

         <template v-for="category, index in filterCategories(privateState.data)">
           <div v-bind:class="['mdl-tabs__panel', category === privateState.data[`m${sharedState.metricId}`].category ? 'is-active': '']" v-bind:id="tabId(index)">
             <template v-for="m in filterMetrics(privateState.data, category)">
               <button type="button" v-bind:class="['mdl-chip', m.metric === sharedState.metricId ? 'is-active' : '']" v-on:click="changeMetric(m.metric)">
                 <span class="mdl-chip__text">{{m.title}}</span>
               </button>
             </template>
           </div>
         </template>

      </div>
    </div>
</template>

<script>
    import {replaceState, gaEvent} from '../modules/tracking';
    import fetchData from '../modules/fetch';


    export default {
        name: 'tabs',
        methods: {
          changeMetric: function(metric) {
            if (this.sharedState.metricId !== metric) {
              replaceState(metric, this.sharedState.selected, this.sharedState.geography.id);
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
          },
          tabId: function(id, prefix = '') {
            return `${prefix}tab${id}-panel`;
          }
        }
    }
</script>

<style lang="css" scoped>
  .mdl-tabs__tab {
    padding: 0 14px;
  }
  .mdl-tabs__panel {
    padding: 10px;
  }
  .mdl-tabs__tab-bar {
    justify-content: left;
  }
  .mdl-tabs.is-upgraded .mdl-tabs__tab.is-active:after {
    background: #ff4081;
    height: 4px;
  }
  .mdl-chip {
    margin: 2px;
    cursor: pointer;
  }
  .mdl-chip.is-active {
    background: #ff4081;
    color: white;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
  }

  @media (max-width: 975px) {
    .category-tabs {
      display: none;
    }
  }
</style>

<style>
  .mdl-tabs__panel {
    display: none;
  }
</style>
