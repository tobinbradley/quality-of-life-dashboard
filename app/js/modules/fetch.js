import dataConfig from '../../../data/config/data';
import siteConfig from '../../../data/config/site';
import axios from 'axios';
import jenksBreaks from './jenksbreaks';

export default function fetchData(appState, metric=null, geography=null) {
  if (metric) {
    appState.metricId = metric;
  }
  else {
    metric = appState.metricId;
  }
  if (!geography) {
    geography = appState.geography.id;
  }

  // Check that data exists for this metric & geography, otherwise switch geography.
  if (dataConfig[`m${appState.metricId}`].geographies.indexOf(geography) === -1) {
    geography = dataConfig[`m${appState.metricId}`].geographies[0];
  }

  // fetch data
  axios.get(`data/metric/${geography}/m${appState.metricId}.json`).then(function(data) {
    let nKeys = Object.keys(data.data.map);
    let yKeys = Object.keys(data.data.map[nKeys[0]]);
    let years = yKeys.map(function(el) {
      return el.replace('y_', '');
    });

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
      data: data.data,
    };
    appState.year = years[years.length - 1];
    appState.breaks = jenksBreaks(data.data.map, years, nKeys, 5);

    // Switch geographies.
    if (geography && appState.geography.id !== geography) {
      appState.geography = siteConfig.geographies.find((g) => (g.id === geography));
    }
  });

  // fetch metadata
  axios.get(`./data/meta/m${metric}.html`).then(function(response) {
    appState.metadata = response.data;
  });
}
