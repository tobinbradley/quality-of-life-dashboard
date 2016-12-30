import isNumeric from './isnumeric';
import {valsToArray} from './metric_calculations';

function geojsonDataMerge(g, d, y) {
    // get array max
    let valsArray = valsToArray(d, [y], Object.keys(d));
    let heightFactor = 5000 / Math.max.apply(Math, valsArray);

    for (let i = 0; i < g.features.length; i++) {
        if (isNumeric(d[g.features[i].properties.id][`y_${y}`])) {
            g.features[i].properties.choropleth = d[g.features[i].properties.id][`y_${y}`];
            g.features[i].properties.height = d[g.features[i].properties.id][`y_${y}`] * heightFactor;
        } else  {
            g.features[i].properties.choropleth = 'null';
            g.features[i].properties.height = 'null';
        }
    }
    return g;
}

export default geojsonDataMerge;
