const _ = require('lodash');
const siteConfig = require('./data/config/site.js');
const dataConfig = require('./data/config/data.js');

// whatsnew handlebars data
let whatsnew = _.filter(dataConfig, function(el) {
  return siteConfig.whatsnew.indexOf(el.metric) !== -1;
});

module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/,
      },
    },
    stylesheets: {
      joinTo: {
        'vendor.css': /^(?!app)/,
        'app.css': /^app/,
      },
    },
  },
  npm: {
    styles: {
      'material-design-lite': ['dist/material.min.css'],
      'mapbox-gl': ['dist/mapbox-gl.css'],
      chartist: ['dist/chartist.css'],
    },
  },
  plugins: {
    babel: {
      presets: [
        [
          'env',
          {
            targets: {
              browsers: ['last 2 versions', 'safari >= 8'],
            },
          },
        ],
      ],
      ignore: [/node_modules/],
    },
    postcss: {
      processors: [require('postcss-cssnext')({browsers: ['last 2 versions']})],
    },
    handlebars: {
      locals: {
        siteConfig: siteConfig,
        dataConfig: dataConfig,
        selectgroups: require('./data/config/selectgroups.js'),
        whatsnew: whatsnew,
      },
      include: {enabled: false},
    },
    swPrecache: {
      options: {
        staticFileGlobs: [
          'public/**/*.{js,css,png,jpg,gif,svg,eot,ttf,woff,woff2}',
          'public/index.html',
          'public/manifest.json',
          'public/data/geography.geojson.json',
          'public/style/positron-mecklenburg.json',
        ],
        stripPrefix: 'public/',
      },
    },
  },
};
