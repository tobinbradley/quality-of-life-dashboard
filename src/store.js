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

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    metric: metrics,
    selected: selected,
    dataConfig: data.sort((a, b) => (a.title > b.title ? 1 : -1)),
    dataOptions: options,
    siteConfig: site,
    modal: { modal: null, options: null },
    displayMode: 'desktop' // desktop, print, embed
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
      // do something with URL
      writeState(state.metric, state.selected)
    },
    addMetric(state, payload) {
      state.metric.push(payload)
      // do something with URL
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
    },
    toggleSelected(state, payload) {
      const pos = state.selected[payload.geography].indexOf(payload.id)
      if (pos === -1) {
        state.selected[payload.geography].push(payload.id)
      } else {
        state.selected[payload.geography].splice(pos, 1)
      }
      writeState(state.metric, state.selected)
    },
    setDisplayMode(state, payload) {
      state.displayMode = payload
    },
    popState(state, payload) {
      state.metric = payload.metric
      state.selected = payload.selected
    },
    setModal(state, payload) {
      state.modal = payload
    }
  }
})
