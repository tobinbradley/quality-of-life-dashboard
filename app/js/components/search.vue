<template lang="html">
    <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop search-container">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
            <input class="mdl-textfield__input" type="text" id="sample3" v-model="privateState.query" v-on:focus="search()" autocomplete="off">
            <label class="mdl-textfield__label" for="sample3">Search...</label>
        </div>
        <div class="search-instructions" v-if="privateState.results.metric.length === 0 && privateState.results.NSA.length === 0 &&  privateState.results.neighborhood.length === 0 &&  privateState.results.zipcode.length === 0 && privateState.results.address.length === 0">
            Enter a <span class="tooltip" v-bind:title="privateState.neighborhoodDefinition">{{ privateState.neighborhoodDescriptor }}</span>, address, or zip code.
        </div>
        <div class="search-results">
            <ul v-for="n in privateState.results.neighborhood">
                <li v-on:click="selectNeighborhoods(n.select)">
                    <span class="search-result-type">{{privateState.neighborhoodDescriptor}}</span>
                    <span class="search-result-label">{{n.label}}</span>
                    <!-- <svg class="icon"><use xlink:href="#icon-keyboard_arrow_right"></use></svg> -->
                </li>
            </ul>
            <ul v-for="n in privateState.results.metric">
              <li v-on:click="selectMetric(n.select)">
                <span class="search-result-type">METRIC</span>
                <span class="search-result-label">{{n.label}}</span>
                <!-- <svg class="icon"><use xlink:href="#icon-keyboard_arrow_right"></use></svg> -->
              </li>
            </ul>
            <ul v-for="n in privateState.results.NSA">
              <li v-on:click="selectNeighborhoods(n.select)">
                <span class="search-result-type">NSA</span>
                <span class="search-result-label">{{n.label}}</span>
                <!-- <svg class="icon"><use xlink:href="#icon-keyboard_arrow_right"></use></svg> -->
              </li>
            </ul>
            <ul v-for="n in privateState.results.zipcode">
                <li v-on:click="selectNeighborhoods(n.select)">
                    <span class="search-result-type">ZIPCODE</span>
                    <span class="search-result-label">{{n.label}}</span>
                    <!-- <svg class="icon"><use xlink:href="#icon-keyboard_arrow_right"></use></svg> -->
                </li>
            </ul>
            <ul v-for="n in privateState.results.address">
                <li v-on:click="selectLocation(n.lng, n.lat, n.label)">
                    <span class="search-result-type">ADDRESS</span>
                    <span class="search-result-label">{{n.label | trimLabel}}</span>
                    <!-- <svg class="icon"><use xlink:href="#icon-keyboard_arrow_right"></use></svg> -->
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import debounce from 'lodash.debounce';
import isNumeric from '../modules/isnumeric';
import dataConfig from '../../../data/config/data.js';
import {replaceState, gaEvent} from '../modules/tracking';
import fetchData from '../modules/fetch';

export default {
    name: 'sc-search',
    watch: {
        'privateState.query': 'search'
    },
    filters: {
        trimLabel: function(label) {
            if (label.length > 32) {
                label = `${label.substring(0, 32)}...`;
            }
            return label;
        }
    },
    methods: {
        search: function() {
            let _this = this;
            let debounceSearch = debounce(function() {
                let query = _this.privateState.query.trim();

                _this.searchNeighborhood(query);
                _this.searchAddress(query);
                _this.searchZipcode(query);
                _this.searchNSA(query);
                _this.searchMetric(query);
            }, 250);
            debounceSearch();
        },
        clearResults: function() {
            let keys = Object.keys(this.privateState.results);
            for (let i = 0; i < keys.length; i++) {
                this.privateState.results[keys[i]] = [];
            }
        },
      searchMetric: function(query) {
        if (query.length >= 3 && !isNumeric(query)) {
          this.privateState.results.metric = [];
          let _this = this;
          let k;
          for (k in dataConfig) {
            if (dataConfig[k].title.toUpperCase().indexOf(query.toUpperCase()) !== -1) {
              _this.privateState.results.metric.push({'label': dataConfig[k].title, 'select': dataConfig[k].metric})
            }
          }
        } else {
          this.privateState.results.metric = [];
        }
      },
      searchNSA: function(query) {
        if (query.length >= 3 && !isNumeric(query)) {
          let _this = this;
          axios.get('https://mcmap.org/api/intersect_feature/v1/neighborhood_statistical_areas/neighborhoods', {
            params: {
              'geom_column_from': 'the_geom',
              'geom_column_to': 'the_geom',
              'columns': 'f.nsa_name, t.id',
              'filter': `nsa_name ilike '${query}%'`
            }
          })
            .then(function (response) {
              _this.privateState.results.NSA = [];
              if (response.data.length > 0) {
                const nsas = [...new Set(response.data.map(item => item.nsa_name))];
                nsas.forEach(function(nsa) {
                  let npa_items = response.data.filter(item => item.nsa_name === nsa);
                  let npas = [...new Set(npa_items.map(item => item.id))];
                  _this.privateState.results.NSA.push({'label': nsa, 'select': npas.map(String)});
                });
              }
            });
        } else {
          this.privateState.results.NSA = [];
        }
      },
        searchZipcode: function(query) {
            if (query.length === 5 && isNumeric(query)) {
                let _this = this;
                axios.get('https://mcmap.org/api/intersect_feature/v1/zipcodes/neighborhoods', {
                    params: {
                      'geom_column_from': 'the_geom',
                      'geom_column_to': 'the_geom',
                      'columns': 't.id',
                      'filter': `zip='${query}'`
                    }
                  })
                  .then(function (response) {
                      _this.privateState.results.zipcode = [];
                      if (response.data.length > 0) {
                          let selected = [];
                          for (let i = 0; i < response.data.length; i++) {
                              selected.push(`${response.data[i].id}`);
                          }
                          _this.privateState.results.zipcode.push({ 'label': query, 'select': selected });
                      }
                  });
            } else {
                this.privateState.results.zipcode = [];
            }
        },
        searchNeighborhood: function(query) {
            this.privateState.results.neighborhood = [];
            if (query.length > 0) {
                let keys = Object.keys(this.sharedState.metric.data.map);
                let match = keys.indexOf(query);
                if (match !== -1) {
                    this.privateState.results.neighborhood.push({'label': keys[match], 'select': [keys[match]]});
                }
            }
        },
        searchAddress: function(query) {
            if (query.length > 4 && !isNumeric(query)) {
                let _this = this;
                axios.get(`https://mcmap.org/api/search/v1/${query.toLowerCase()}`, {
                    params: {
                      'limit': 5
                    }
                  })
                  .then(function (response) {
                       _this.privateState.results.address = [];
                      if (response.data.length > 0) {
                          for (let i = 0; i < response.data.length; i++) {
                              _this.privateState.results.address.push({ 'label': response.data[i].address, 'lng':  response.data[i].lng, 'lat': response.data[i].lat});
                          }
                      }
                  });
            } else {
                this.privateState.results.address = [];
            }
        },
        selectMetric: function(metric) {
          this.clearResults();
          replaceState(metric, this.sharedState.selected);
          gaEvent('metric', dataConfig[`m${metric}`].title.trim(), dataConfig[`m${metric}`].category.trim());
          fetchData(this.sharedState, metric);
        },
        selectNeighborhoods: function(n) {
            this.clearResults();
            this.sharedState.selected = n;
            this.sharedState.zoomNeighborhoods = n.slice(0);  // this hack is to keep selected and zoomNeighborhoods from linking
        },
        selectLocation: function(lng, lat, label) {
            this.clearResults();
            let _this = this;
            axios.get(`https://mcmap.org/api/intersect_point/v1/neighborhoods/${lng},${lat}/4326`, {
                params: {
                    'geom_column': 'the_geom',
                    'columns': 'id',
                    'limit': 1
                }
            }).then(function(response) {
                if (response.data.length === 1) {
                    _this.sharedState.selected = [`${response.data[0].id}`];
                    _this.sharedState.zoomNeighborhoods = [`${response.data[0].id}`];
                    _this.sharedState.marker = {
                        lng: lng,
                        lat: lat,
                        label: label
                    };
                }
            });

        }
    }
};
</script>

<style lang="css" scoped>
.search-container {
    padding: 10px;
    min-height: 91px;
}
.search-instructions {
    font-size: 0.9em;
}
.mdl-textfield {
    width: 100%;
    display: block;
}
.tooltip {
    border-bottom: 1px dashed;
}
ul {
    padding: 0;
    margin: 0;
}
li {
    list-style-type:none;
    padding: 2px;
    border: 1px solid rgb(0,145,234);
    border-radius: 3px;
    margin: 0;
    display: inline-block;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
    transition: 0.2s ease all;
    color: rgb(0,145,234);
    font-size: 0.9em;
    white-space: nowrap;
    overflow: hidden;
}
li:hover {
   background: rgb(0,145,234);
   color: white;
}
.search-result-label {
   text-decoration: none;
}
.search-results.i, search-results.span {
   pointer-events: none;
}
.icon {
   float: right;
   width: 24px;
   height: 24px;
}
.search-result-type {
   background-color: rgb(0,145,234);
   color: white;
   padding: 3px;
   font-weight: bold;
   border-radius: 3px;
}
.search-result-empty {
   font-size: 1.4em;
   margin-left: 20px;
   margin-right: 20px;
}
.search-result-empty i {
   margin-right: 5px;
   float: left;
}
</style>
