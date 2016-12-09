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

import Vue from 'vue/dist/vue.js';
import axios from 'axios';
import dataConfig from '../../data/config/data';
import mapConfig from '../../data/config/map';
import siteConfig from '../../data/config/site';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import {replaceState, gaEvent} from './modules/tracking';
import getURLParameter from './modules/geturlparams';
import scrollTo from './modules/scrollto';
import querystring from 'querystring';
import Sidenav from './components/sidebar-nav.vue';
import Metadata from './components/metadata.vue';
import YearControl from './components/years.vue';
import DataTable from './components/datatable.vue';
import TrendChart from './components/trendchart.vue';
import DistributionChart from './components/distributionchart.vue';
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
    marker: null,
    zoomNeighborhoods: []
};

// for debugging
window.appState = appState;

// get random metric if none provided and validate if metric is provided
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


// Component data setup
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
            title: null,
            qolembedURL: siteConfig.qolembedURL
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
TrendChart.data = function() {
    return {
        sharedState: appState,
        privateState: {
            chart: null
        }
    };
};
DistributionChart.data = function() {
    return {
        sharedState: appState,
        privateState: {
            chart: null,
            chartData: null
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


// pass newly created mdl elements through mdl
Vue.directive('mdl', {
    bind: function(el) {
        componentHandler.upgradeElement(el);
    }
});


// initialize components
new Vue({
    el: 'sc-search',
    render: h => h(Search)
});
new Vue({
    el: 'sc-sidenav',
    render: h => h(Sidenav)
});
new Vue({
    el: 'sc-metadata',
    render: h => h(Metadata)
});
new Vue({
    el: 'sc-years',
    render: h => h(YearControl)
});
new Vue({
    el: 'sc-datatable',
    render: h => h(DataTable)
});
new Vue({
    el: 'sc-distributionchart',
    render: h => h(DistributionChart)
});
new Vue({
    el: 'sc-trendchart',
    render: h => h(TrendChart)
});
new Vue({
    el: 'sc-toc',
    render: h => h(ToC)
});
new Vue({
    el: 'sc-embedcode',
    render: h => h(EmbedCode)
});
new Vue({
    el: 'sc-map',
    render: h => h(MapGL)
});


////////////////////////////////////////////////////////////////////////////
// General non-component page interactions
///////////////////////////////////////////////////////////////////////////

// change metric from meta links
window.changeMetric = function(m) {
    let metric = m.replace('m', '');
    replaceState(metric, appState.selected);
    gaEvent('metric', dataConfig[`m${metric}`].title.trim(), dataConfig[`m${metric}`].category.trim());
    fetchData(appState, metric);
    scrollTo(document.querySelector(".mdl-layout__content"), 0, 600);
};


// select groups if present
let selectGroups = document.querySelectorAll('li[data-selectGroup]');
Array.from(selectGroups).forEach(link => {
    link.addEventListener('click', function() {
        let selectList = link.getAttribute('data-selectGroup').split(",");
        appState.selected = selectList;
        appState.zoomNeighborhoods = selectList.slice(0);
    });
});

// what's new links
let whatsnew = document.querySelectorAll('span[data-whatsnew]');
Array.from(whatsnew).forEach(link => {
    link.addEventListener('click', function() {
        let metric = link.getAttribute('data-whatsnew');
        replaceState(metric, appState.selected);
        gaEvent('metric', dataConfig[`m${metric}`].title.trim(), dataConfig[`m${metric}`].category.trim());
        fetchData(appState, metric);
        scrollTo(document.querySelector(".mdl-layout__content"), 0, 600);
    });
});

// clear selected button
let clearselected = document.querySelector('.selected-clear');
if (clearselected) {
    clearselected.addEventListener('click', function() {
        appState.selected = [];
        replaceState(appState.metricId, []);
    }, false);
}

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
