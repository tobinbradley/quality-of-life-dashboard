# Quality of Life Dashboard v3

A dashboard for community data and health. See our [demo site](http://mcmap.org/qolv3).

The original repository with old versions of the Dashboard is [here](https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard).

## Related Projects

*   [quality-of-life-embed](https://github.com/tobinbradley/quality-of-life-embed)
*   [quality-of-life-report](https://github.com/tobinbradley/quality-of-life-report)
*   [quality-of-life-data](https://github.com/tobinbradley/mecklenburg-quality-of-life-data)

## Get Started

This project requires [NodeJS](https://nodejs.org).

``` terminal
git clone https://github.com/tobinbradley/quality-of-life-dashboard.git dashboard
cd dashboard
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data.git data
npm install
npm run build
npm run datagen
npm start
```

The Dashboard should launch in your default web browser with a live reload server. To build the site for production, run `npm run build` and copy the `public` folder contents to your web server.

## Customizing the Dashboard

Most Dashboard customization can be accomplished by creating your own data repository [following the directions here](https://github.com/tobinbradley/mecklenburg-quality-of-life-data). The data repository includes Dashboard meta (title, author, keywords, etc.), map style and configuration settings, data, etc.

The Dashboard is built using [Vue.js](http://vuejs.org/), [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/api/), and [Material Design Lite](https://getmdl.io/). The business end of things consists of independent Vue.js components in `app/js/components`. You can very easily create or disable your own components as needed. Each component has a shared state between all the components. Additionally, some components have a private state for things only needed by that component.

The `app/js/search.vue` component searches for the geography id, zip codes, and addresses. Zip code and address searches use HTTP API's from our [Dirt Simple PostGIS HTTP API](https://github.com/tobinbradley/dirt-simple-postgis-http-api) project with Mecklenburg data and won't work for other areas (only the geography ID search will work). Setting up new searches is fairly straight-forward and you can customize it to meet your needs.
