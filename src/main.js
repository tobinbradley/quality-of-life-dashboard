import Vue from 'vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import polyfill from 'dynamic-polyfill'
import './main.css'

/**
 * polyfills for IE 11
 */
polyfill({
  fills: ['fetch', 'Promise'],
  minify: true,
  gated: true,
  rum: false,
  afterFill() {
    main()
  }
})

function main() {
  Vue.config.productionTip = false

  new Vue({
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')

}
