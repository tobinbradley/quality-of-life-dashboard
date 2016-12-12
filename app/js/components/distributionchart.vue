<template lang="html">
    <div class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
        <div class="scatterplot mdl-typography--text-center">
            <h1>Data Distribution, {{sharedState.year}}</h1>
            <span v-show="sharedState.selected.length > 0"><i class="material-icons legend legend-selected">lens</i> Selected</span>
            <span><i class="material-icons legend legend-median">more_horiz</i> Median {{privateState.median}}</span>
            <div class="ct-distributionchart"></div>
        </div>
    </div>
</template>

<script>
import Chartist from 'chartist';
import isNumeric from '../modules/isnumeric';
import {abbrNum, round, prettyNumber} from '../modules/number_format';
import {median} from '../modules/metric_calculations';

export default {
    name: 'sc-distributionchart',
    watch: {
        'sharedState.metric.data': 'renderChart',
        'sharedState.selected': 'renderChart',
        'sharedState.year': 'renderChart'
    },
    methods: {
        renderChart: function() {
            let data = this.updateData();
            let _this = this;

            var options = {
                showLine: false,
                showPoint: false,
                showArea: true,
                fullWidth: true,
                height: '160px',
                chartPadding: {
                    bottom: 0
                },
                axisX: {
                    labelInterpolationFnc: function(value, index) {
                        return null;
                    }
                },
                axisY: {
                    labelInterpolationFnc: function(value, index) {
                        return abbrNum(round(Number(value), 2), 2);
                    }
                },
                series: {
                    'series-selected': {
                        showLine: false,
                        showPoint: true,
                        showArea: false
                    },
                    'series-median': {
                        showLine: true,
                        showPoint: false,
                        showArea: false,
                    }
                }                    
            };

            this.privateState.chart = new Chartist.Line('.ct-distributionchart', data, options);

        },
        updateData: function() {
            let chartData = {
                labels: [],
                series: []
            };
            let _this = this;
            let metric = this.sharedState.metric;

            // get values
            let data = this.dataToSortedArray(this.sharedState.metric.data.map, this.sharedState.year);
            let med = median(data.map(function(el) { return el.val }));
            _this.privateState.median = prettyNumber(med, metric.config.decimals, metric.config.prefix, metric.config.suffix);

            // populate chart data
            let dataArrayA = [];
            let dataArrayB = [];
            let dataArrayC = [];
            let dataArrayD = [];
            let dataArrayE = [];
            let dataArrayMedian = [];
            let dataArraySelected = [];

            for (let i = 0; i < data.length; i++) {
                // set chart labels
                chartData.labels.push(data[i].id);
                // set selected points
                if (_this.sharedState.selected.indexOf(data[i].id) !== -1) {
                    dataArraySelected.push(data[i].val);
                } else {
                    dataArraySelected.push(null);
                }
                // set median
                if (i === 0 || i === data.length - 1) {
                    dataArrayMedian.push(med);
                } else {
                    dataArrayMedian.push(med);
                }

                // set lines based on breaks
                if (data[i].val <= _this.sharedState.breaks[1]) {
                    dataArrayA.push(data[i].val);
                    dataArrayB.push(null);
                    dataArrayC.push(null);
                    dataArrayD.push(null);
                    dataArrayE.push(null);
                }
                else if (data[i].val <= _this.sharedState.breaks[2]) {
                    dataArrayB.push(data[i].val);
                    dataArrayA.push(null);
                    dataArrayC.push(null);
                    dataArrayD.push(null);
                    dataArrayE.push(null);
                }
                else if (data[i].val <= _this.sharedState.breaks[3]) {
                    dataArrayC.push(data[i].val);
                    dataArrayB.push(null);
                    dataArrayA.push(null);
                    dataArrayD.push(null);
                    dataArrayE.push(null);
                }
                else if (data[i].val <= _this.sharedState.breaks[4]) {
                    dataArrayD.push(data[i].val);
                    dataArrayB.push(null);
                    dataArrayC.push(null);
                    dataArrayA.push(null);
                    dataArrayE.push(null);
                }
                else {
                    dataArrayE.push(data[i].val);
                    dataArrayB.push(null);
                    dataArrayC.push(null);
                    dataArrayD.push(null);
                    dataArrayA.push(null);
                }                
            }
            chartData.series.push({name: 'series-1', data: dataArrayA});
            chartData.series.push({name: 'series-2', data: dataArrayB});
            chartData.series.push({name: 'series-3', data: dataArrayC});
            chartData.series.push({name: 'series-4', data: dataArrayD});
            chartData.series.push({name: 'series-5', data: dataArrayE});
            chartData.series.push({name: 'series-median', data: dataArrayMedian});
            chartData.series.push({name: 'series-selected', data: dataArraySelected});

            return chartData;
        },
        dataToSortedArray: function(data, year) {
            let dataArray = [];
            let keys = Object.keys(data);

            for (var i = 0; i < keys.length; i++) {
                if (isNumeric(data[keys[i]][`y_${year}`])) {
                    dataArray.push({ "id": keys[i], "val": data[keys[i]][`y_${year}`]});
                }
            }

            dataArray.sort(function(a, b){
                return a.val - b.val;
            });

            this.privateState.chartData = dataArray;

            return dataArray;
        }
    }
};
</script>

<style>
    /* selected */    
    .ct-distributionchart .ct-point {
        stroke: orange;
        stroke-width: 10;
    }

    /* distribution series */
    .ct-distributionchart .ct-area {
        fill-opacity: 0.8;
    }
    .ct-distributionchart .ct-series-a .ct-line, .ct-distributionchart .ct-series-a .ct-area {
        stroke: rgb(238,250,227);
        fill: rgb(238,250,227);
    }
    .ct-distributionchart .ct-series-b .ct-line, .ct-distributionchart .ct-series-b .ct-area {
        stroke: rgb(186,228,188);
        fill: rgb(186,228,188);
    }
    .ct-distributionchart .ct-series-c .ct-line, .ct-distributionchart .ct-series-c .ct-area {
        stroke: rgb(123,204,196);
        fill: rgb(123,204,196);
    }
    .ct-distributionchart .ct-series-d .ct-line, .ct-distributionchart .ct-series-d .ct-area {
        stroke: rgb(67,162,202);
        fill: rgb(67,162,202);
    }
    .ct-distributionchart .ct-series-e .ct-line, .ct-distributionchart .ct-series-e .ct-area {
        stroke: rgb(8,104,172);
        fill: rgb(8,104,172);
    }
    .ct-distributionchart .ct-series-f .ct-line {
        stroke: #666;
        stroke-dasharray: 5, 2;
        stroke-width: 2;
    }
</style>

<style lang="css" scoped>

    h1 {
        font-size: 1.2em;
        margin: 15px 0 0;
    }
    span {
        font-size: 0.8em;
    }
    .material-icons {
        vertical-align: sub;
    }
    .legend {
        font-size: 1.2em;
    }
    .legend-selected {
        color: orange;
    }
    .legend-median {
        color: #666;
    }

</style>
