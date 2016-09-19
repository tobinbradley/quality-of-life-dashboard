<template lang="html">
    <div v-if="sharedState.selected.length > 0 && sharedState.metric.data" id="datatable">
        <div class="tablescroll">
            <table class="mdl-data-table mdl-js-data-table">
                <thead>
                    <tr>
                        <th class="mdl-data-table__cell--non-numeric">NPA</th>
                        <th>{{sharedState.year}} Value<br></th>
                        <th v-if="sharedState.metric.data.a">Accuracy</th>
                        <th v-if="sharedState.metric.years.length > 1">Trend<br>{{sharedState.metric.years[0]}}-{{sharedState.metric.years[sharedState.metric.years.length - 1]}}</th>
                        <th v-if="sharedState.metric.config.raw_label">Number</th>
                        <th v-if="sharedState.metric.years.length > 1 && sharedState.metric.config.raw_label">Trend<br>{{sharedState.metric.years[0]}}-{{sharedState.metric.years[sharedState.metric.years.length - 1]}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in sharedState.selected">
                        <td class="mdl-data-table__cell--non-numeric">{{n}}</td>
                        <td>{{sharedState.metric.data.map[n][`y_${sharedState.year}`] | formatVal }}</td>
                        <td v-if="sharedState.metric.config.accuracy"> &#177; {{sharedState.metric.data.a[n][`y_${sharedState.year}`] | formatVal}}</td>
                        <td v-if="sharedState.metric.years.length > 1">{{{n | trend}}}</td>
                        <td v-if="sharedState.metric.config.raw_label &&  sharedState.metric.data.w">{{ sharedState.metric.data.w[n][`y_${sharedState.year}`] * sharedState.metric.data.map[n][`y_${sharedState.year}`] | formatRaw}}<span class="units" v-if="sharedState.metric.config.raw_label"> {{{sharedState.metric.config.raw_label}}}</span></td>
                        <td v-if="sharedState.metric.years.length > 1 && sharedState.metric.config.raw_label">{{{n | trendRaw }}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="mdl-typography--text-right">
            <a download="data.csv" class="mdl-button mdl-js-button mdl-js-ripple-effect download" v-on:click="downloadTable('#datatable table')">
                Download
            </a>
        </p>
    </div>
</template>

<script>
import table2csv from '../modules/table2csv';
import {prettyNumber} from '../modules/number_format';
import isNumeric from '../modules/isnumeric';

export default {
    name: 'sc-datatable',
    methods: {
        downloadTable: function(theTable) {
            let csvData = table2csv(theTable);
            // i hate you ie
            if (window.navigator.msSaveBlob) {
                let blob = new Blob([csvData],{ type: "application/csv;charset=utf-8;"});
                navigator.msSaveBlob(blob, 'data.csv');
            } else {
                document.querySelector('#datatable .download').href = 'data:text/csv;charset=utf-8;base64,' + btoa(csvData);
            }
        },
        trendIcon: function(num) {
            if (num === 0) {
                return '<i class="material-icons">trending_flat</i>';
            } else if (num > 0) {
                return '<i class="material-icons">trending_up</i>';
            } else {
                return '<i class="material-icons">trending_down</i>';
            }
        }
    },
    filters: {
        formatVal: function(num) {
            let sharedState = this.sharedState;
            return prettyNumber(num, sharedState.metric.config.decimals, sharedState.metric.config.prefix, sharedState.metric.config.suffix);
        },
        formatRaw: function(num) {
            return prettyNumber(num, 0);
        },
        trend: function (n) {
            let sharedState = this.sharedState;
            let begin = sharedState.metric.data.map[n][`y_${sharedState.metric.years[sharedState.metric.years.length - 1]}`];
            let end = sharedState.metric.data.map[n][`y_${sharedState.metric.years[0]}`];

            if (isNumeric(begin) && isNumeric(end)) {
                let trendVal = begin - end;
                return `${this.trendIcon(trendVal)} ${prettyNumber(trendVal, this.sharedState.metric.config.decimals, this.sharedState.metric.config.prefix, this.sharedState.metric.config.suffix)}`;
            } else {
                return '--';
            }
        },
        trendRaw(n) {
            let sharedState = this.sharedState;
            let begin = sharedState.metric.data.map[n][`y_${sharedState.metric.years[sharedState.metric.years.length - 1]}`] * sharedState.metric.data.w[n][`y_${sharedState.metric.years[sharedState.metric.years.length - 1]}`];
            let end = sharedState.metric.data.map[n][`y_${sharedState.metric.years[0]}`] * sharedState.metric.data.w[n][`y_${sharedState.metric.years[0]}`];

            if (isNumeric(begin) && isNumeric(end)) {
                let trendVal = begin - end;
                return  `${this.trendIcon(trendVal)} ${prettyNumber(trendVal, 0)}`;
            } else {
                return  '--';
            }
        }
    }
};
</script>

<style lang="css">
#datatable {
    margin: 10px 15px;
    .tablescroll {
        max-height: 350px;
        overflow: auto;
    }
    table {
        width: 100%;
        tbody tr, tbody td {
            height: 28px;
            padding: 5px 18px 5px 24px;
        }
    }
    p {
        margin-top: 10px;
    }
    .material-icons {
        vertical-align: middle;
    }
}
</style>
