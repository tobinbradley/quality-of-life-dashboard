const siteConfig = require('./data/config/site.json');

Object.keys(siteConfig).forEach(key => {
  process.env[`VUE_APP_${key}`] = siteConfig[key];
});

module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '' : '/',
  css: {
    sourceMap: true
  }
};