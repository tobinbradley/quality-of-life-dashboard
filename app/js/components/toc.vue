<template lang="html">
    <div id="toc" v-if="sharedState.metric.config" class="top left">
        <div>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" alt="white background for printing">
            <div class="tocposition">
                <a href="javascript:void(0)" title="swap horizontal position" v-on:click="swap_horizontal()"><i class="material-icons" title="swap vertical position">swap_horiz</i></a>
                <a href="javascript:void(0)" v-on:click="swap_vertical()"><i class="material-icons">swap_vert</i></a>
            </div>
            <h1 class="title">{{ sharedState.metric.config.title }}, {{ sharedState.year }}</h1>
            <div class="metricboxes">
                <div class="metricbox" v-if="sharedState.selected.length > 0">
                    <span class="metrictype">SELECTED</span>
                    <span class="metricvalue">{{ privateState.selected }}</span>
                </div>
                <div class="metricbox">
                    <span class="metrictype">COUNTY</span>
                    <span class="metricvalue">{{ privateState.area }}</span>
                </div>
            </div>
            <h2 v-if="privateState.metaDesc" class="description">
                {{{ privateState.metaDesc }}}<span v-if="sharedState.metric.config.label"> ({{ sharedState.metric.config.label.toLowerCase() }})</span>.
                <span v-if="sharedState.metric.config.raw_label">
                    The County total is {{privateState.areaRaw}} {{{sharedState.metric.config.raw_label.toLowerCase()}}}.
                </span>
                <span v-if="sharedState.metric.config.raw_label && sharedState.selected.length > 0">
                    The selected total is {{privateState.selectedRaw}} {{{sharedState.metric.config.raw_label.toLowerCase()}}}.
                </span>
            </h2>
            <div class="legend">
                <svg  v-if="sharedState.breaks" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 248.4 39.2"id="maplegend" role="img" aria-labelledby="svgTitle">
                    <title id="svgTitle">Choropleth legend</title>
                    <g transform="translate(20.714293 -851.75475)">
                        <rect y="865.9" x="-20.7" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[0]}"/>
                        <rect width="50" height="25" x="28.9" y="865.9" v-bind:style="{fill: this.sharedState.colors[1]}"/>
                        <rect width="50" height="25" x="78.5" y="865.9" v-bind:style="{fill: this.sharedState.colors[2]}"/>
                        <rect y="865.9" x="128.1" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[3]}"/>
                        <rect width="50" height="25" x="177.6" y="865.9" v-bind:style="{fill: this.sharedState.colors[4]}"/>
                        <text x="-19.5" y="864.3" class="legendText">
                          <tspan x="-19.5" y="864.3">{{sharedState.breaks[0] | abbrNumber }}</tspan>
                        </text>
                        <text y="864.4" x="28.6" class="legendText">
                          <tspan y="864.4" x="28.6">{{sharedState.breaks[1] | abbrNumber }}</tspan>
                        </text>
                        <text x="78.4" y="864.4" class="legendText">
                          <tspan x="78.4" y="864.4">{{sharedState.breaks[2] | abbrNumber }}</tspan>
                        </text>
                        <text y="864.4" x="128" class="legendText">
                          <tspan y="864.4" x="128">{{sharedState.breaks[3] | abbrNumber }}</tspan>
                        </text>
                        <text x="177.8" y="864.4" class="legendText">
                          <tspan x="177.8" y="864.4">{{sharedState.breaks[4] | abbrNumber }}</tspan>
                        </text>
                        <text y="864.3" x="225.8" class="legendText">
                          <tspan y="864.3" x="225.8">{{sharedState.breaks[5] | abbrNumber }}</tspan>
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

export default {
    name: 'sc-toc',
    filters: {
        abbrNumber: function (value) {
            let num = abbrNum(value, 1);
            if (isNumeric(num)) {
                return round(num, this.sharedState.metric.config.decimals);
            } else {
                return num;
            }
        }
    },
    watch: {
        'sharedState.metric': 'processData',
        'sharedState.metadata': 'getMetaDesc',
        'sharedState.selected': 'processSelected',
        'sharedState.year': 'processYear'
    },
    methods: {
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
        swap_horizontal: function() {
            let el = document.querySelector("#toc");
            if (el.classList.contains("left")) {
                el.classList.remove("left");
                el.classList.add("right");
            } else {
                el.classList.remove("right");
                el.classList.add("left");
            }
        },
        swap_vertical: function() {
            let el = document.querySelector("#toc");
            if (el.classList.contains("top")) {
                el.classList.remove("top");
                el.classList.add("bottom");
            } else {
                el.classList.remove("bottom");
                el.classList.add("top");
            }
        }
    }
}
</script>

<style lang="css">
#toc.top {
    top: 3px;
}
#toc.bottom {
    bottom: 3px;
}
#toc.left {
    left: 3px;
}
#toc.right {
    right: 3px;
}
#toc {
    position: absolute;
    width: 260px;
    background: white;
    box-shadow: 0 1px 3px #666, 0 6px 5px -5px #666;

    .tocposition {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 0.8em;
        z-index: 20;
        a {
            color: #333;
            opacity: 0.8;
        }
        .material-icons {
            font-size: 18px;
        }
    }

	.title, .description, .legend, .metricboxes {
      position: relative;
      z-index: 10;
    }

    .metricboxes {
        padding: 10px 0 10px;
        text-align: center;
        display: flex;
        flex-flow: row nowrap;
    }
    .metricbox {
        width: 50%;
        padding: 0 10px;
        margin: 0 auto;
        span {
            display: block;
            font-size: 12px;
        }
        .metrictype {
            font-weight: bold;
            font-size: 12px;
            color: #727272;
        }
        .metricvalue {
            margin-top: 3px;
            font-weight: bold;
            font-size: 19px;
        }
    }

    .title {
      padding: 20px 10px 15px;
      border-bottom: 1px solid rgba(0,0,0,0.15);
      word-wrap: break-word;
	  font-size: 16px;
    }

    .description {
        padding: 5px 10px 10px;
	    font-size: 12px;
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
        pointer-events: none; /* fix for ie11 click making legend disappear */
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

    }
}
</style>
