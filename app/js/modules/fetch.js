import dataConfig from '../../../data/config/data';
import axios from 'axios';
import jenksBreaks from './jenksbreaks';

export default function fetchData(appState, metric) {
    appState.metricId = metric;

    // fetch data
    axios.get(`data/metric/m${appState.metricId}.json`)
        .then(function (data) {
            let nKeys = Object.keys(data.data.map);
            let yKeys = Object.keys(data.data.map[nKeys[0]]);
            let years = yKeys.map(function(el) { return el.replace('y_', ''); });

            // drop invalid selected values
            for (let i = 0; i < appState.selected.length; i++) {
                if (nKeys.indexOf(appState.selected[i]) === -1) {
                    let pos = appState.selected.indexOf(appState.selected[i]);
                    appState.selected.splice(pos, 1);
                }
            }

            appState.metric = {
                config: dataConfig[`m${metric}`],
                years: years,
                data: data.data
            };
            appState.year = years[years.length - 1];
            appState.breaks = jenksBreaks(data.data.map, years, nKeys, 5);

        });

    // fetch metadata
    axios.get(`./data/meta/m${metric}.html`)
        .then(function (response) {
            appState.metadata = response.data;
        });
}
