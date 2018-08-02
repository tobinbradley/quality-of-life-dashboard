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

require('./modules/ie-polyfill-array-from.js'); // fix for array from on IE11
require('material-design-lite');

//import {introJs} from 'intro.js';
import Vue from 'vue';
import axios from 'axios';
import dataConfig from '../data/config/data';
import mapConfig from '../data/config/map.json';
import siteConfig from '../data/config/site.json';
import selectGroups from '../data/config/selectgroups';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import {
  replaceState,
  gaEvent,
  getHash,
  urlArgsToHash
} from './modules/tracking';
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
import Footer from './components/footer.vue';
import Social from './components/social.vue';
import Offline from './components/offline.vue';
import Tabs from './components/tabs.vue';
import Whatsnew from './components/whatsnew.vue';
import Selectgroup from './components/selectgroup.vue';
import Intro from './components/intro.vue';
import ieSVGFixes from './modules/ie-svg-bugs.js';
import mapStyle from '../data/gl-style/positron-mecklenburg.json';
import './main.css';
import './registerServiceWorker';

Vue.config.productionTip = false;

// fix ie SVG bugs
ieSVGFixes();

// help system
//for (const el of document.querySelectorAll('.help')) {
//  el.addEventListener('click', function() {
//    console.log('click');
//    introJs().start();
//  });
//}

// youtube video
// document.querySelector('.youtube').addEventListener('click', function() {
//   let theElem = document.querySelector('.youtube');
//   let id = theElem.getAttribute('id');

//   // create iframe
//   var iframe = document.createElement('iframe');
//   var url = `https://www.youtube.com/embed/${
//     id
//   }?autoplay=1&autohide=1&${theElem.getAttribute('data-params')}`;
//   iframe.src = url;
//   iframe.setAttribute('allowfullscreen', 'allowfullscreen');
//   iframe.setAttribute('frameborder', '0');
//   iframe.setAttribute('aria-label', 'GeoPortal video tutorial');
//   theElem.appendChild(iframe);
// });

// the shared state between components
let appState = {
  metric: {
    config: null,
    years: [],
    data: null
  },
  colors: colors.breaksGnBu5,
  breaks: [0, 0, 0, 0, 0, 0],
  selected: [],
  highlight: [],
  year: null,
  metadata: null,
  marker: null,
  zoomNeighborhoods: []
};

// for debugging
//window.appState = appState;

// fix meta links
let model = {
  metricId: ''
};
window.model = model;

// reset old GET args to hash
urlArgsToHash();

// get random metric if none provided and validate if metric is provided
let keys = Object.keys(dataConfig);
let metricId = keys[Math.floor(Math.random() * keys.length)].replace('m', '');
if (getHash(0)) {
  let passedMetric = getHash(0).replace('m', '');
  if (keys.indexOf(`m${passedMetric}`) !== -1) {
    metricId = passedMetric;
  }
}

// set selected if provided
if (getHash(1)) {
  appState.selected = getHash(1);
}

// grab initial data
fetchData(appState, metricId);

// show intro if flag not set
if (!localStorage.getItem('hideIntro')) {
  Intro.data = function() {
    return {
      siteConfig: siteConfig,
      hide: false
    };
  };
  new Vue({
    el: 'sc-intro',
    render: h => h(Intro)
  });
}

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
        address: [],
        NSA: [],
        metric: []
      },
      neighborhoodDescriptor: siteConfig.neighborhoodDescriptor,
      neighborhoodDefinition: siteConfig.neighborhoodDefinition
    },
    sharedState: appState
  };
};
Metadata.data = function() {
  return {
    sharedState: appState,
    privateState: {
      model: model
    }
  };
};

YearControl.data = function() {
  return {
    sharedState: appState,
    privateState: {
      playToggle: null
    }
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
Selectgroup.data = function() {
  return {
    sharedState: appState,
    selectGroup: selectGroups
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
Footer.data = function() {
  return {
    sharedState: appState,
    privateState: {
      links: siteConfig.links
    }
  };
};
Social.data = function() {
  return {
    sharedState: appState,
    privateState: {
      links: siteConfig.links
    }
  };
};
Tabs.data = function() {
  return {
    sharedState: appState,
    privateState: {
      data: dataConfig,
      filterVal: null
    }
  };
};
Whatsnew.data = function() {
  return {
    sharedState: appState,
    data: dataConfig,
    whatsnew: siteConfig.whatsnew
  };
};
DistributionChart.data = function() {
  return {
    sharedState: appState,
    privateState: {
      chart: null,
      chartData: null,
      median: null
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
        style: mapStyle,
        attributionControl: false,
        zoom: mapConfig.zoom,
        center: mapConfig.center,
        maxBounds: mapConfig.maxBounds,
        minZoom: mapConfig.minZoom,
        preserveDrawingBuffer:
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1
      },
      mapLoaded: false,
      metricId: null,
      geoJSON: null,
      isPitched3D: false,
      locationPopup: null,
      neighborhoodsBefore: mapConfig.neighborhoodsBefore,
      neighborhoodsSelectedBefore: mapConfig.neighborhoodsSelectedBefore
    }
  };
};

// pass newly created mdl elements through mdl
//Vue.directive('mdl', {
//    bind: function(el) {
//        componentHandler.upgradeElement(el);
//    }
//});

// initialize components
new Vue({
  el: 'sc-search',
  render: h => h(Search)
});
new Vue({
  el: 'sc-tabs',
  render: h => h(Tabs)
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
  el: 'sc-selectgroup',
  render: h => h(Selectgroup)
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
new Vue({
  el: 'sc-footer',
  render: h => h(Footer)
});
new Vue({
  el: 'sc-social',
  render: h => h(Social)
});
new Vue({
  el: 'sc-whatsnew',
  render: h => h(Whatsnew)
});
// offline message
new Vue({
  el: 'sc-offline',
  render: h => h(Offline)
});

////////////////////////////////////////////////////////////////////////////
// General non-component page interactions
///////////////////////////////////////////////////////////////////////////

// change metric from meta links
window.changeMetric = function(m) {
  let metric = m.replace('m', '');
  replaceState(metric, appState.selected);
  gaEvent(
    'metric',
    dataConfig[`m${metric}`].title.trim(),
    dataConfig[`m${metric}`].category.trim()
  );
  fetchData(appState, metric);
  scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
};

// clear selected button
let clearselected = document.querySelector('.selected-clear');
if (clearselected) {
  clearselected.addEventListener(
    'click',
    function() {
      appState.selected = [];
      replaceState(appState.metricId, []);
    },
    false
  );
}

// Reports
let reportEmbed = document.querySelector('button[data-printmap]');
let reportFull = document.querySelector('button[data-fullreport]');
if (reportEmbed) {
  reportEmbed.addEventListener('click', function() {
    window.open(
      `${siteConfig.qolembedURL}?m=${appState.metricId}&y=${
        appState.year
      }&s=${appState.selected.join(',')}`
    );
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
      axios
        .post(
          siteConfig.contactForm,
          querystring.stringify({
            email: email.value,
            url: window.location.href,
            agent: navigator.userAgent,
            subject: 'Quality of Life Dashboard Feedback',
            to: 'tobin.bradley@gmail.com',
            message: message.value
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
        .then(function() {
          document.querySelector('.comment-form').style.display = 'none';
          document.querySelector('.comment-complete').style.display = 'block';
        });
    }
  });
}