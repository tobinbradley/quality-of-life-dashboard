<template lang="html">
    <div v-show="sharedState.metric.years.length > 1" class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center">
        <div class="trendchart">
            <h1 v-if="sharedState.metric.config">{{ sharedState.metric.config.title }}</h1>
            <span class="legend"><svg class="icon legend-county"><use xlink:href="#icon-trending_up"></use></svg> County</span>
            <span v-show="sharedState.selected.length > 0" class="legend"><svg class="icon legend-selected"><use xlink:href="#icon-trending_up"></use></svg> Selected</span>
            <div class="ct-trendchart"></div>
        </div>
    </div>
</template>

<script>
    import Chartist from 'chartist';
    require('chartist-plugin-axistitle');
    require('chartist-plugin-tooltip-infl');
    import {calcValue} from '../modules/metric_calculations';
    import {abbrNum, round, prettyNumber} from '../modules/number_format';

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
                    let options = {
                        fullWidth: true,
                        height: '180px',
                        showArea: false,
                        low: 0,
                        chartPadding: {
                            right: 40
                        },
                        lineSmooth: Chartist.Interpolation.cardinal({
                            fillHoles: true,
                        }),
                        axisY: {
                            labelInterpolationFnc: function(value, index) {
                                return abbrNum(round(Number(value), 2), 2);
                            }
                        },
                        axisX: {
                            labelInterpolationFnc: function(value, index) {
                                let len = _this.sharedState.metric.years[_this.sharedState.metric.years.length - 1] - _this.sharedState.metric.years[0];
                                if (len > 6) {
                                    return index % 2 === 0 ? value : null;
                                } else {
                                    return value;
                                }
                            }
                        },
                        plugins: [
                            Chartist.plugins.tooltip({
                                transformTooltipTextFnc: function(value) {
                                    return prettyNumber(value, _this.sharedState.metric.config.decimals, _this.sharedState.metric.config.prefix, _this.sharedState.metric.config.suffix);
                                }
                            })
                        ]
                    };
                    // axis labels
                    if (_this.sharedState.metric.config.label) {
                        options.plugins.push(Chartist.plugins.ctAxisTitle({
                            axisX: {
                                axisTitle: '',
                                axisClass: 'ct-axis-title',
                                offset: {
                                    x: 0,
                                    y: 50
                                },
                                textAnchor: 'middle'
                            },
                            axisY: {
                                axisTitle: _this.sharedState.metric.config.label,
                                axisClass: 'ct-axis-title',
                                offset: {
                                    x: 0,
                                    y: -1
                                },
                                flipTitle: false,
                                textAnchor: 'middle'
                            }
                        }));
                    }
                    // set range from 0 to 100 for percentages
                    if (this.sharedState.metric.config.suffix && this.sharedState.metric.config.suffix === '%') {
                        options.high = 100;
                    }
                    this.privateState.chart = new Chartist.Line('.ct-trendchart', data, options);
                    // animation
                    this.privateState.chart.on('draw', function(data) {
                        if (data.type === 'line') {
                            data.element.animate({
                                d: {
                                    begin: 500 * data.index,
                                    dur: 500,
                                    from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                                    to: data.path.clone().stringify(),
                                    easing: Chartist.Svg.Easing.easeOutQuint
                                },
                                opacity: {
                                    begin: 500 * data.index,
                                    dur: 500,
                                    from: 0,
                                    to: 1
                                }
                            });
                        }
                    });
                } else {
                    if (this.privateState.chart) {
                        this.privateState.chart.detach();
                        this.privateState.chart = null;
                    }
                }
            },
            updateData: function() {
                // for filling in missing years
                let _this = this;
                let minYear = this.sharedState.metric.years[0];
                let maxYear = this.sharedState.metric.years[this.sharedState.metric.years.length - 1];
                let yearsLength = parseInt(maxYear) - parseInt(minYear) + 1;
                let filledYears = Array.apply(0, Array(yearsLength)).map(function(_, b) {
                    return b + parseInt(minYear)
                });
                let chartData = {
                    labels: filledYears,
                    series: []
                };
                // county values
                let keys = Object.keys(this.sharedState.metric.data.map);
                let areaArray = [];
                let metric = this.sharedState.metric;
                // county value
                for (let i = 0; i < chartData.labels.length; i++) {
                    let areaValue = null;
                    if (this.sharedState.metric.years.indexOf(chartData.labels[i].toString()) !== -1) {
                        if (metric.config.world_val && metric.config.world_val[`y_${chartData.labels[i]}`]) {
                            areaValue = metric.config.world_val[`y_${chartData.labels[i]}`];
                        } else {
                            areaValue = calcValue(this.sharedState.metric.data, this.sharedState.metric.config.type, chartData.labels[i], keys);
                        }
                    }
                    areaArray.push({
                        meta: 'County',
                        value: areaValue
                    });
                }
                chartData.series.push(areaArray);
                // selected values
                if (this.sharedState.selected.length > 0) {
                    let selectedArray = [];
                    for (let i = 0; i < chartData.labels.length; i++) {
                        if (this.sharedState.metric.years.indexOf(chartData.labels[i].toString()) !== -1) {
                            let selectedValue = calcValue(this.sharedState.metric.data, this.sharedState.metric.config.type, chartData.labels[i], this.sharedState.selected);
                            selectedArray.push({
                                meta: 'Selected',
                                value: selectedValue
                            });
                        } else {
                            selectedArray.push(null);
                        }
                    }
                    chartData.series.push(selectedArray);
                }
                return chartData;
            }
        }
    };
</script>

<style lang="css">
.qol-chart .ct-series-b .ct-line,
.qol-chart .ct-series-b .ct-point {
  stroke: #ba00e4;
}
.qol-chart .ct-series-a .ct-line,
.qol-chart .ct-series-a .ct-point {
  stroke: orange;
}
.ct-trendchart {
  margin-left: 20px;
}
.ct-axis-title {
  font-size: 10px;
  fill: rgba(0, 0, 0, 0.6);
}
.chartist-tooltip {
  position: absolute;
  display: inline-block;
  opacity: 0;
  min-width: 5em;
  padding: 0.5em;
  background: rgba(0, 0, 0, 0.85);
  color: #ccc;
  font-family: Oxygen, Helvetica, Arial, sans-serif;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
  z-index: 1;
  border-radius: 5px;
  transition: opacity 0.2s linear;
}
.chartist-tooltip:before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 0;
  height: 0;
  margin-left: -15px;
  border: 15px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.85);
}
.chartist-tooltip.tooltip-show {
  opacity: 1;
}
.ct-area,
.ct-line {
  pointer-events: none;
}
</style>

<style lang="css" scoped>
h1 {
  font-size: 1.1em;
  margin: 15px 0 0;
}
span.legend {
  font-size: 0.8em;
}
.icon {
  vertical-align: middle;
  width: 1.5em;
  height: 1.5em;
}
.legend-selected {
  color: #ba00e4;
}
.legend-county {
  color: orange;
}
</style>
