import Vue from 'vue'
import Vuex from 'vuex'
import data from '../data/data'
import options from '../data/options'
import site from '../site'
import { readMetrics, readSelected, writeState } from './js/history'

// get geojson layers in to selected object
const selected = {}
options.geojson.forEach(elem => {
  selected[elem.layer] = []
})

// check history
const metrics =
  readMetrics(data) ||
  options.defaultMetrics[
    Math.floor(Math.random() * options.defaultMetrics.length)
  ]
readSelected(selected, options.defaultgeojson)

// detect if site is in iframe
const iFramed = window.self !== window.top
if (iFramed) {
  setInterval(function() {
    window.top.postMessage({ pageHeight: document.body.scrollHeight }, '*')
  }, 500)
}

console.log(iFramed);

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    metric: metrics,
    selected: selected,
    dataConfig: data.sort((a, b) => (a.title > b.title ? 1 : -1)),
    dataOptions: options,
    siteConfig: site,
    modal: { modal: null, options: null },
    iFramed: iFramed,
    displayMode: 'desktop', // desktop, print, embed
    selectPoint: { point: [], remove: false }
  },
  getters: {
    dataConfig: state => id => {
      return state.dataConfig.filter(element => {
        return element.metric === id
      })[0]
    },
    geojsonName: (state, getters) => id => {
      return getters.dataConfig(id).geojson || state.dataOptions.defaultgeojson
    },
    selected: state => payload => {
      return state.selected[payload]
    }
  },
  mutations: {
    setMetric(state, payload) {
      state.metric = payload
      writeState(state.metric, state.selected)
    },
    setHighlight(state, payload) {
      state.highlight[payload.geography] = payload.highlight
    },
    setSelected(state, payload) {
      state.selected[payload.geography] = payload.selected
      writeState(state.metric, state.selected)
    },
    addSelected(state, payload) {
      state.selected[payload.geography] = [
        ...new Set([...state.selected[payload.geography], ...payload.id])
      ]
      writeState(state.metric, state.selected)
    },
    removeSelected(state, payload) {
      const pos = state.selected[payload.geography].indexOf(payload.id)
      if (pos !== -1) {
        state.selected[payload.geography].splice(pos, 1)
        writeState(state.metric, state.selected)
      }
    },
    clearSelected(state) {
      const keys = Object.keys(state.selected)
      keys.forEach(key => {
        state.selected[key] = []
      })
      writeState(state.metric, state.selected)
    },
    setDisplayMode(state, payload) {
      state.displayMode = payload
    },
    popState(state, payload) {
      state.metric = payload.metric
      state.selected = payload.selected
    },
    selectPoint(state, payload) {
      state.selectPoint = payload
    },
    togglePoint(state, payload) {
      state.togglePoint = payload
    }
  }
})
