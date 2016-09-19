import isNumeric from './isnumeric';

function geojsonDataMerge(g, d, y) {
    for (let i = 0; i < g.features.length; i++) {
        if (isNumeric(d[g.features[i].properties.id][`y_${y}`])) {
            g.features[i].properties.choropleth = d[g.features[i].properties.id][`y_${y}`];
        } else  {
            g.features[i].properties.choropleth = 'null';
        }
    }
    return g;
}

export default geojsonDataMerge;
