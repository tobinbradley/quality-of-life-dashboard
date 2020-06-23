const siteConfig = require('./data/config/site.json');

Object.keys(siteConfig).forEach(key => {
  process.env[`VUE_APP_${key}`] = siteConfig[key];
});

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  css: {
    sourceMap: true
  },
 devServer: {
    host: '0.0.0.0',
    disableHostCheck: true
  }
};