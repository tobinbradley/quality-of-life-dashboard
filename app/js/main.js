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
import siteConfig from '../../data/config/site';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import getURLParameter from './modules/geturlparams';
import querystring from 'querystring';
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
if (getURLParameter("m")) {
    let passedMetric = getURLParameter("m").replace('m', '');
    if (keys.indexOf(`m${passedMetric}`) !== -1) {
        metricId = passedMetric;
    }
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
            },
            neighborhoodDescriptor: siteConfig.neighborhoodDescriptor,
            neighborhoodDefinition: siteConfig.neighborhoodDefinition
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
        sharedState: appState,
        privateState: {
            neighborhoodDescriptor: siteConfig.neighborhoodDescriptor,
            neighborhoodDefinition: siteConfig.neighborhoodDefinition
        }
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
            locationPopup: null,
            neighborhoodsBefore: mapConfig.neighborhoodsBefore,
            neighborhoodsSelectedBefore: mapConfig.neighborhoodsSelectedBefore
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
        appState.zoomNeighborhoods = selectList.slice(0);
    });
});

// clear selected button
document.querySelector('.selected-clear').addEventListener('click', function() {
    appState.selected = [];
    window.history.replaceState(null, null, `./?m=${appState.metricId}&s=${appState.selected.join(',')}`);
}, false);

// Reports
let reportEmbed = document.querySelector('li[data-printmap]');
let reportFull = document.querySelector('li[data-fullreport]');
if (reportEmbed) {
    reportEmbed.addEventListener('click', function() {
        window.open(`${siteConfig.qolembedURL}?m=${appState.metricId}&y=${appState.year}&s=${appState.selected.join(',')}`);
    });
}
if (reportFull) {
    reportFull.addEventListener('click', function() {
        window.open(`${siteConfig.qolreportURL}?s=${appState.selected.join(',')}`);
    });
}

// contact form
let contactForm = document.querySelector('#contact-submit');
if (contactForm) {
    contactForm.addEventListener('click', function() {
        let message = document.querySelector('#contact-message');
        let email = document.querySelector('#contact-email');

        if (message.checkValidity() && email.checkValidity()) {
            axios.post(siteConfig.contactForm,
                querystring.stringify({
                    email: email.value,
                    url: window.location.href,
                    agent: navigator.userAgent,
                    subject: "Quality of Life Dashboard Feedback",
                    to: "tobin.bradley@gmail.com",
                    message: message.value
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
                .then(function() {
                    document.querySelector('.comment-form').style.display = 'none';
                    document.querySelector('.comment-complete').style.display = 'block';
                });
        }
    });
}
