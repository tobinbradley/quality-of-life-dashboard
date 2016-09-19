<template lang="html">
    <div v-if="sharedState.metric.years.length > 1" class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center">
        <div class="trendchart">
            <h1>Trend</h1>
            <span class="legend"><i class="material-icons legend-county">trending_up</i> County</span>
            <span class="legend"><i class="material-icons legend-selected">trending_up</i> Selected</span>
            <div class="ct-trendchart"></div>
        </div>
    </div>
</template>

<script>
import Chartist from 'chartist';
import {calcValue} from '../modules/metric_calculations';
import {abbrNum, round} from '../modules/number_format';

export default {
    name: 'sc-trendchart',
    watch: {
        'sharedState.metric.data': 'renderChart',
        'sharedState.selected': 'renderChart'
    },
    methods: {
        renderChart: function() {
            if (this.sharedState.metric.years.length > 1) {
                let _this = this;
                let data = this.updateData();

                if (!this.privateState.chart) {
                    let options = {
                        fullWidth: true,
                        height: '200px',
                        showArea: false,
                        chartPadding: {
                            right: 40
                        },
                        axisY: {
                            labelInterpolationFnc: function(value, index) {
                                return abbrNum(round(Number(value), 2), 2);
                            }
                        },
                        axisX: {
                            labelInterpolationFnc: function(value, index) {
                                if (_this.sharedState.metric.years.length > 6) {
                                    return index % 2 === 0 ? value : null;
                                } else {
                                    return value;
                                }
                            }
                        }
                    };
                    this.privateState.chart = new Chartist.Line('.ct-trendchart', data, options);

                    // animation
                    // this.privateState.chart.on('draw', function(data) {
                    //     if(data.type === 'line') {
                    //         data.element.animate({
                    //           d: {
                    //             begin: 500 * data.index,
                    //             dur: 500,
                    //             from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                    //             to: data.path.clone().stringify(),
                    //             easing: Chartist.Svg.Easing.easeOutQuint
                    //           },
                    //           opacity: {
                    //             begin: 500 * data.index,
                    //             dur: 500,
                    //             from: 0,
                    //             to: 1
                    //           }
                    //       });
                    //     }
                    // });

                } else {
                    this.privateState.chart.update(data);
                }
            } else {
                if (this.privateState.chart) {
                    this.privateState.chart.detach();
                    this.privateState.chart = null;
                }
            }
        },
        updateData: function() {
            let chartData = {
                labels: this.sharedState.metric.years,
                series: []
            };

            // county values
            let keys = Object.keys(this.sharedState.metric.data.map);
            let areaArray = [];
            let metric = this.sharedState.metric;

            for (let i = 0; i < this.sharedState.metric.years.length; i++) {
                let areaValue;
                if (metric.config.world_val && metric.config.world_val[`y_${this.sharedState.metric.years[i]}`]) {
                    areaValue = metric.config.world_val[`y_${this.sharedState.metric.years[i]}`];
                } else {
                    areaValue = calcValue(this.sharedState.metric.data, this.sharedState.metric.config.type, this.sharedState.metric.years[i], keys);                    
                }
                areaArray.push(areaValue);
            }
            chartData.series.push(areaArray);

            // selected values
            if (this.sharedState.selected.length > 0) {
                let selectedArray = [];
                for (let i = 0; i < this.sharedState.metric.years.length; i++) {
                    let selectedValue = calcValue(this.sharedState.metric.data, this.sharedState.metric.config.type, this.sharedState.metric.years[i], this.sharedState.selected);
                    selectedArray.push(selectedValue);
                }
                chartData.series.push(selectedArray);
            }

            return chartData;
        }
    }
};
</script>

<style lang="css">
.trendchart {
    h1 {
        font-size: 1.2em;
        margin: 15px 0 0;
    }
    span.legend {
        font-size: 0.8em;
        display: inline !important;
    }
    .material-icons {
        vertical-align: middle;
        font-size: 1.5em;
    }
    .legend-selected {
        color: orange;
    }
    .legend-county {
        color: #d70206;
    }
    .ct-series-b .ct-line, .ct-series-b .ct-point {
        stroke: orange;
    }
}
</style>
