<template lang="html">
    <div class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
        <div class="scatterplot mdl-typography--text-center">
            <h1>Data Distribution, {{sharedState.year}}</h1>
            <span><i class="material-icons legend-selected">lens</i> Selected</span>
            <div class="ct-scatterplot"></div>
        </div>
    </div>
    <div class="demo-separator mdl-cell--1-col"></div>
</template>

<script>
import Chartist from 'chartist';
import isNumeric from '../modules/isnumeric';
import {abbrNum, round} from '../modules/number_format';

export default {
    name: 'sc-scatterplot',
    watch: {
        'sharedState.metric.data': 'renderChart',
        'sharedState.selected': 'renderChart',
        'sharedState.year': 'renderChart'
    },
    methods: {
        renderChart: function() {
            let data = this.updateData();
            let _this = this;

            if (!this.privateState.chart) {
                var options = {
                    showLine: false,
                    fullWidth: true,
                    height: '200px',
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
                    }
                };

                this.privateState.chart = new Chartist.Line('.ct-scatterplot', data, options);

                this.privateState.chart.on('draw', function(data) {
                    if (data.type === 'point') {

                        data.element.attr({
                            'data-id': _this.privateState.chartData[data.index].id,
                            class: _this.sharedState.selected.indexOf(_this.privateState.chartData[data.index].id) > -1 ? 'ct-point selected': 'ct-point'
                        });

                        // animation
                        // data.element.animate({
                        //   x1: {
                        //     begin: 1 * data.index,
                        //     dur: 2,
                        //     from: data.x - 10,
                        //     to: data.x,
                        //     easing: 'easeOutQuart'
                        //   },
                        //   x2: {
                        //     begin: 1 * data.index,
                        //     dur: 2,
                        //     from: data.x - 10,
                        //     to: data.x,
                        //     easing: 'easeOutQuart'
                        //   },
                        //   opacity: {
                        //     begin: 1 * data.index,
                        //     dur: 2,
                        //     from: 0,
                        //     to: 1,
                        //     easing: 'easeOutQuart'
                        //   }
                        // });
                    }
                });
            } else {
                this.privateState.chart.update(data);
            }

        },
        updateData: function() {
            let chartData = {
                labels: [],
                series: []
            };

            // get values
            let data = this.dataToSortedArray(this.sharedState.metric.data.map, this.sharedState.year);

            // populate chart data
            let dataArray = [];
            for (let i = 0; i < data.length; i++) {
                chartData.labels.push(data[i].id);
                dataArray.push(data[i].val);
            }
            chartData.series.push(dataArray);

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

<style lang="css">
.scatterplot {
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
    .legend-selected {
        color: orange;
        font-size: 1.2em;
    }
    .ct-scatterplot {
        .ct-point {
            stroke: #8a8a8a;
            stroke-width: 2;
        }
        .ct-point.selected {
            stroke: orange;
            stroke-width: 12;
        }
    }
}

</style>
