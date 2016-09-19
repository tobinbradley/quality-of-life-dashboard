// __________________________________
//   QoL Dashboard v3               |
//   Tobin Bradley                  |
//   Mecklenburg County GIS         |
// ----------------------------------
//        \   ^__^
//         \  (oo)\_______
//            (__)\       )\/\
//                ||----w |
//                ||     ||
//

require('es6-promise').polyfill(); // Fix for axios on IE11
require('material-design-lite');

import Vue from 'vue';
import axios from 'axios';
import dataConfig from '../../data/config/data';
import mapConfig from '../../data/config/map';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import getURLParameter from './modules/geturlparams';
import Sidenav from './components/sidebar-nav.vue';
import Metadata from './components/metadata.vue';
import YearControl from './components/years.vue';
import DataTable from './components/datatable.vue';
import ScatterPlot from './components/scatterplot.vue';
import TrendChart from './components/trendchart.vue';
import ToC from './components/toc.vue';
import MapGL from './components/map.vue';
import Search from './components/search.vue';
import EmbedCode from './components/embedcode.vue';



// the shared state between components
let appState = {
    metric: {
        config: null,
        years: [],
        data: null
    },
    colors: colors.breaksGnBu5,
    breaks: [0,0,0,0,0,0],
    selected: [],
    year: null,
    metadata: null,
    mapBounds: [],
    marker: null,
    zoomNeighborhoods: []
};

// for debugging
window.appState = appState;

// get random metric if none provided and validate provided
let keys = Object.keys(dataConfig);
let metricId = keys[Math.floor(Math.random() * keys.length)].replace('m', '');
if (getURLParameter("m") && keys.indexOf(`m${getURLParameter("m")}`) !== -1) {
    metricId = getURLParameter("m");
}

// set selected if provided
if (getURLParameter("s")) {
    appState.selected = getURLParameter("s").split(',');
}

// grab initial data
fetchData(appState, metricId);


// Component data
// data store divided into privateState, for things specific to that component,
// and sharedState, for data shared between components
Sidenav.data = function() {
    return {
        privateState: {
            data: dataConfig,
            filterVal: null
        },
        sharedState: appState
    };
};

Search.data = function() {
    return {
        privateState: {
            query: '',
            results: {
                neighborhood: [],
                zipcode: [],
                address: []
            }
        },
        sharedState: appState
    };
};

Metadata.data = function() {
    return {
        sharedState: appState
    };
};

YearControl.data = function() {
    return {
        sharedState: appState
    };
};

EmbedCode.data = function() {
    return {
        sharedState: appState,
        privateState: {
            title: null
        }
    };
};

DataTable.data = function() {
    return {
        sharedState: appState
    };
};

ScatterPlot.data = function() {
    return {
        sharedState: appState,
        privateState: {
            chart: null,
            chartData: null
        }
    };
};

TrendChart.data = function() {
    return {
        sharedState: appState,
        privateState: {
            chart: null
        }
    };
};

ToC.data = function() {
    return {
        sharedState: appState,
        privateState: {
            metaDesc: null,
            selected: null,
            area: null,
            selectedRaw: null,
            areaRaw: null
        }
    };
};

MapGL.data = function() {
    return {
        sharedState: appState,
        privateState: {
            locate: null,
            mapOptions: {
                container: 'map',
                style: mapConfig.style,
                attributionControl: false,
                zoom: mapConfig.zoom,
                center: mapConfig.center,
                maxBounds: mapConfig.maxBounds,
                minZoom: mapConfig.minZoom,
                preserveDrawingBuffer: mapConfig.preserveDrawingBuffer
            },
            mapLoaded: false,
            metricId: null,
            geoJSON: null,
            locationPopup: null
        }
    };
};

Vue.directive('mdl', {
    bind: function() {
        componentHandler.upgradeElement(this.el);
    }
});

// initialize components
new Vue({
    el: 'body',
    components: {
        'sc-search': Search,
        'sc-sidenav': Sidenav,
        'sc-metadata': Metadata,
        'sc-years': YearControl,
        'sc-datatable': DataTable,
        'sc-scatterplot': ScatterPlot,
        'sc-trendchart': TrendChart,
        'sc-toc': ToC,
        'sc-map': MapGL,
        'sc-embedcode': EmbedCode
    }
});


////////////////////////////////////////////////////////////////////////////
// General non-component page interactions
///////////////////////////////////////////////////////////////////////////

// select groups if present
let selectGroups = document.querySelectorAll('li[data-selectGroup]');
Array.from(selectGroups).forEach(link => {
    link.addEventListener('click', function() {
        let selectList = link.getAttribute('data-selectGroup').split(",");
        appState.selected = selectList;
        appState.zoomNeighborhoods = selectList;
    });
});

// clear selected button
document.querySelector('.selected-clear').addEventListener('click', function() {
    appState.selected = [];
    window.history.replaceState(null, null, `./?m=${appState.metricId}&s=${appState.selected.join(',')}`);
}, false);

// Reports
window.reportFull = function() {
    window.open(`http://mcmap.org/qol-report/?s=${appState.selected.join(',')}`);
};
window.reportEmbed = function() {
    window.open(`http://mcmap.org/qol-embed/?m=${appState.metricId}&y=${appState.year}&s=${appState.selected.join(',')}`);
};

// contact form
document.querySelector('#contact-submit').addEventListener('click', function() {
    let message = document.querySelector('#contact-message');
    let email = document.querySelector('#contact-email');

    if (message.checkValidity() && email.checkValidity()) {
        axios.post('http://mcmap.org/utilities/feedback.php', {
            email: email.value,
            url: window.location.href,
            agent: navigator.userAgent,
            subject: "Quality of Life Dashboard Feedback",
            to: "tobin.bradley@gmail.com",
            message: message.value
        })
        .then(function() {
            document.querySelector('.comment-form').style.display = 'none';
            document.querySelector('.comment-complete').style.display = 'block';
        });
    }
});
