<template lang="html">
    <div id="toc" v-if="sharedState.metric.config" class="top left">
        <div>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" alt="white background for printing">
            <div class="tocposition">
                <a href="javascript:void(0)" title="Move Table of Contents" v-on:click="position()"><svg class="icon"><use xlink:href="#icon-zoom_out_map"></use></svg></a>
            </div>
            <h1 class="title">{{ sharedState.metric.config.title }}, {{ sharedState.year }}</h1>
            <h2 v-if="privateState.metaDesc" class="description">
                <span v-html="privateState.metaDesc"></span>
            </h2>
            <div class="metricboxes">
                <div class="metricbox" v-if="sharedState.selected.length > 0">
                    <span class="metrictype">SELECTED</span>
                    <span class="metricvalue">{{ privateState.selected }}</span>
                    <span v-if="sharedState.metric.config.label" class="metriclabel">{{ sharedState.metric.config.label.toLowerCase() }}</span>
                    <span v-if="sharedState.metric.config.raw_label && sharedState.selected.length > 0" class="metric-raw">
                        <span>or</span>
                        <span class="metricvalue metricraw">{{privateState.selectedRaw}}</span>
                        <span v-html="sharedState.metric.config.raw_label.toLowerCase()" class="metriclabel"></span>
                    </span>
                </div>
                <div class="metricbox">
                    <span class="metrictype">COUNTY</span>
                    <span class="metricvalue">{{ privateState.area }}</span>
                    <span v-if="sharedState.metric.config.label" class="metriclabel">{{ sharedState.metric.config.label.toLowerCase() }}</span>
                    <span v-if="sharedState.metric.config.raw_label" class="metric-raw">
                        <span>or</span>
                        <span class="metricvalue metricraw">{{privateState.areaRaw}}</span>
                        <span v-html="sharedState.metric.config.raw_label.toLowerCase()" class="metriclabel"></span>
                    </span>
                </div>
            </div>
            <div class="legend">
                <svg  v-if="sharedState.breaks" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 248.4 39.2" id="maplegend" role="img" aria-labelledby="svgTitle">
                    <title id="svgTitle">Choropleth legend</title>
                    <g transform="translate(20.714293 -851.75475)">
                        <rect y="865.9" x="-20.7" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[0]}" v-on:click="selectBreak(0)" v-on:mouseover="highlight(0)" v-on:mouseout="highlight(-1)"  />
                        <rect width="50" height="25" x="28.9" y="865.9" v-bind:style="{fill: this.sharedState.colors[1]}" v-on:click="selectBreak(1)" v-on:mouseover="highlight(1)" v-on:mouseout="highlight(-1)" />
                        <rect width="50" height="25" x="78.5" y="865.9" v-bind:style="{fill: this.sharedState.colors[2]}" v-on:click="selectBreak(2)" v-on:mouseover="highlight(2)" v-on:mouseout="highlight(-1)" />
                        <rect y="865.9" x="128.1" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[3]}" v-on:click="selectBreak(3)" v-on:mouseover="highlight(3)" v-on:mouseout="highlight(-1)" />
                        <rect width="50" height="25" x="177.6" y="865.9" v-bind:style="{fill: this.sharedState.colors[4]}" v-on:click="selectBreak(4)" v-on:mouseover="highlight(4)" v-on:mouseout="highlight(-1)" />
                        <text x="-19.5" y="864.3" class="legendText">
                          <tspan x="-19.5" y="864.3">{{ abbrNumber(sharedState.breaks[0]) }}</tspan>
                        </text>
                        <text y="864.4" x="28.6" class="legendText">
                          <tspan y="864.4" x="28.6">{{ abbrNumber(sharedState.breaks[1]) }}</tspan>
                        </text>
                        <text x="78.4" y="864.4" class="legendText">
                          <tspan x="78.4" y="864.4">{{ abbrNumber(sharedState.breaks[2]) }}</tspan>
                        </text>
                        <text y="864.4" x="128" class="legendText">
                          <tspan y="864.4" x="128">{{ abbrNumber(sharedState.breaks[3]) }}</tspan>
                        </text>
                        <text x="177.8" y="864.4" class="legendText">
                          <tspan x="177.8" y="864.4">{{ abbrNumber(sharedState.breaks[4]) }}</tspan>
                        </text>
                        <text y="864.3" x="225.8" class="legendText">
                          <tspan y="864.3" x="225.8">{{ abbrNumber(sharedState.breaks[5]) }}</tspan>
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import {abbrNum, round, prettyNumber} from '../modules/number_format';
import {metaDescription} from '../modules/meta';
import isNumeric from '../modules/isnumeric';
import {calcValue, wValsToArray, sum} from '../modules/metric_calculations';
import {replaceState} from '../modules/tracking';

export default {
    name: 'sc-toc',
    watch: {
        'sharedState.metric': 'processData',
        'sharedState.metadata': 'getMetaDesc',
        'sharedState.selected': 'processSelected',
        'sharedState.year': 'processYear'
    },
    methods: {
      highlight: function(n) {
        if (n === -1) {
          this.sharedState.highlight = [];
        } else {
          this.sharedState.highlight = this.getBreakIds(n);
        }
      },
      selectBreak: function(n) {
        this.sharedState.selected = this.getBreakIds(n);
        replaceState(this.sharedState.metricId, this.sharedState.selected, this.sharedState.geographyId);
      },
      getBreakIds: function(n) {
        let _this = this;
        let data = _this.sharedState.metric.data.map;
        let breaks = _this.sharedState.breaks;
        let ids = [];

        // loop through data to get id's
        Object.keys(data).forEach(id => {
          const value = data[id][`y_${_this.sharedState.year}`];

          if (value !== null && value >= breaks[n] && value <= breaks[n + 1]) {
            ids.push(id.toString());
          }
        });

        return ids;
      },

      abbrNumber: function (value) {
            let num = abbrNum(value, 1);
            if (isNumeric(num)) {
                return round(num, this.sharedState.metric.config.decimals);
            } else {
                return num;
            }
        },
        getMetaDesc: function() {
            this.privateState.metaDesc = metaDescription(this.sharedState.metadata).replace('<p>', '').replace('</p>','').trim();
        },
        processData: function() {
            this.processArea();
            this.processSelected();
        },
        processSelected: function() {
            let metric = this.sharedState.metric;

            let selectedValue = calcValue(metric.data, metric.config.type, this.sharedState.year, this.sharedState.selected);
            this.privateState.selected = prettyNumber(selectedValue, metric.config.decimals, metric.config.prefix, metric.config.suffix);
            if (metric.config.raw_label) {
                let rawArray = wValsToArray(metric.data.map, metric.data.w, [this.sharedState.year], this.sharedState.selected);
                let rawValue = sum(rawArray);
                this.privateState.selectedRaw = prettyNumber(rawValue, 0);
            }
        },
        processArea: function() {
            let metric = this.sharedState.metric;
            let keys = Object.keys(metric.data.map);
            if (metric.config.world_val && metric.config.world_val[`y_${this.sharedState.year}`]) {
                this.privateState.area = prettyNumber(metric.config.world_val[`y_${this.sharedState.year}`], metric.config.decimals, metric.config.prefix, metric.config.suffix);
            } else {
                let areaValue = calcValue(metric.data, metric.config.type, this.sharedState.year, keys);
                this.privateState.area = prettyNumber(areaValue, metric.config.decimals, metric.config.prefix, metric.config.suffix);
            }
            if (metric.config.raw_label) {
                let rawArray = wValsToArray(metric.data.map, metric.data.w, [this.sharedState.year], keys);
                let rawValue = sum(rawArray);
                this.privateState.areaRaw = prettyNumber(rawValue, 0);
            }
        },
        processYear: function() {
            this.processArea();
            this.processSelected();
        },
        position: function() {
            let el = document.querySelector("#toc");

            // move to top left from bottom right
            if (el.classList.contains("right")) {
                el.classList.remove('bottom');
                el.classList.remove('right');
                el.classList.add('top');
                el.classList.add('left');
            }
            // move to bottom right from bottom left
            else if (el.classList.contains("bottom")) {
                el.classList.remove('left');
                el.classList.add('right');
            }
            // move to bottom left from top left
            else if (el.classList.contains("top")) {
                el.classList.remove('top');
                el.classList.add('bottom');
            }

        }
    }
}
</script>

<style lang="css" scoped>
#toc.top {
    top: -1px;
}
#toc.bottom {
    bottom: -1px;
}
#toc.left {
    left: -1px;
}
#toc.right {
    right: -1px;
}
#toc {
    position: absolute;
    width: 260px;
    background: white;
    /*box-shadow: 0 1px 3px #666, 0 6px 5px -5px #666;*/
}

.tocposition {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.8em;
    z-index: 20;
}
.tocposition a {
    color: #333;
    opacity: 0.2;
    transition: opacity 0.5s;
}
.tocposition a:hover {
    opacity: 0.8;
}
.tocposition .icon {
    width: 14px;
    height: 14px;
    fill: #ccc;
}

.title, .description, .legend, .metricboxes {
  position: relative;
  z-index: 10;
}

.metricboxes {
    padding: 3px 0 10px;
    text-align: center;
    display: flex;
    flex-flow: row nowrap;
}
.metricbox {
    width: 50%;
    padding: 0 10px;
    margin: 0 auto;

}
.metricbox span {
    display: block;
    font-size: 12px;
}
.metrictype {
    font-weight: bold;
    font-size: 12px;
    color: #727272;
}
.metricvalue {
    margin-top: 0;
    font-weight: bold;
    font-size: 16px !important;
}
.metricvalue.metricraw {
    font-size: 13px !important;
}
.metriclabel {
    line-height: 1.3em;
}

.title {
  padding: 10px 10px 7px;
  border-bottom: 1px solid rgba(0,0,0,0.15);
  word-wrap: break-word;
  font-size: 15px;
}

.description {
    padding: 3px 10px 2px;
    font-size: 12px;
    text-align: center;
}

h1, h2 {
    margin: 0;
    line-height: normal;
}
h1 {
    font-weight: bold;
    line-height: 20px;
}

h2 {
    font-weight: normal;
}

svg {
    display: block;
    width: 100%;
    height: auto;
    max-height: 41px;
    /*pointer-events: none;*/ /* fix for ie11 click making legend disappear */
}

.legendText {
    font-family:'Roboto', sans-serif;
    font-size: 10px;
    letter-spacing:0px;
    line-height:100%;
    stroke-width:1px;
    text-align:center;
    text-anchor:middle;
    word-spacing:0px;
}

.legendText:first-of-type {
    text-align:start;
    text-anchor:start;
}
.legendText:last-of-type {
    text-align:end;
    text-anchor:end;
}

.background-print-img{
    display: none;
}

@media print{
    .background-print-img{
        display: block;
        width:100%;
        height: 99%;
        position:absolute;
        left: 0;
        top: 0;
    }
    .tocposition {
        display: none;
    }
}

@media all and (max-width: 480px) {
    .metric-raw {
        display: none !important;
    }
    #toc {
        width: 200px;
    }
}
</style>
