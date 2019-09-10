# Quality of Life Dashboard

<p>
  <img src="https://img.shields.io/badge/npm-%3E%3D5.5.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D9.3.0-blue.svg" />
  <a href="https://github.com/tobinbradley/quality-of-life-dashboard#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/tobinbradley/quality-of-life-dashboard/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/tobinbradley/quality-of-life-dashboard/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
  <a href="https://twitter.com/fuzzytolerance">
    <img alt="Twitter: fuzzytolerance" src="https://img.shields.io/twitter/follow/fuzzytolerance.svg?style=social" target="_blank" />
  </a>
</p>

> Neighborhood indicators dashboard built with Vue and Mapbox GL JS.

### 🏠 [Homepage](https://github.com/tobinbradley/quality-of-life-dashboard)

## Prerequisites

- git >= 1.0.0
- npm >=5.5.0
- node >=9.3.0

## Install

```sh
git clone https://github.com/tobinbradley/quality-of-life-dashboard.git dashboard
cd dashboard
npm install
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data.git data
npm install
```

You will have to add a data configuration folder for the Dashboard to work. An automatic data configuration for a US State or County can be achieved the [quality-of-life-data-uscensus](https://github.com/tobinbradley/quality-of-life-data-uscensus) repo. From the `dashboard` directory: 

```sh
git clone https://github.com/tobinbradley/quality-of-life-data-uscensus.git data
cd data
npm install
```

You can find out how to set a state or county FIPS code in the [readme](https://github.com/tobinbradley/quality-of-life-data-uscensus).

Alternately, you can use Mecklenburg County's data repo:

```sh
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data.git data
```


## Usage

For development:

```sh
npm run start
```

Build for production:

```sh
npm run build
```

## Options

`site.js` has a number of customization settings you can set.

```javascript
{
  // REQUIRED
  // The title of the app as it appears on the page and in the title meta
  title: 'Charlotte/Mecklenburg Quality of Life Explorer',
  // REQUIRED
  // Author meta tag
  author: 'Tobin Bradley',
  // REQUIRED
  // Key word meta tag
  keywords:
    'GIS,Mecklenburg County,parks,libraries,schools,environment,impervious surface,floodplain,zoning,assessment,tax,photos,government',
  // REQUIRED
  // Description meta tag
  description:
    'Exploring neighborhood character, economics, education, engagement, environment, health, housing, safety and transportation.',
  // OPTIONAL
  // Google analitics tracking key
  // Note if you don't want to use this, you can strip out the GA code in
  // public/index.html and public/embed.html
  gaKey: 'UA-48797957-1',
  // OPTIONAL
  // Location to post contact form. Requires 'submit', 'email', and 'message'
  // post arguments.
  contactForm: 'https://mcmap.org/utilities/mail-qol.php',
  // OPTIONAL
  // YouTube help video URL
  // Make sure to include ?enablejsapi=1 on the end or it won't stop playing
  // when the modal goes away.
  helpUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1',
  // OPTIONAL
  // Links for the left nav bar
  navLinks: [
    {
      title: 'About',
      url: 'http://charlottenc.gov/HNS/CE/CommunityInfo/Pages/QOL.aspx'
    },
    {
      title: 'Download Data',
      url: 'https://mcmap.org/qol/downloads/qol-data.zip'
    },
    {
      title: 'Charlotte Open Data Portal',
      url: 'http://clt.charlotte.opendata.arcgis.com/'
    },
    {
      title: 'Mecklenburg Open Mapping',
      url: 'http://maps.co.mecklenburg.nc.us/openmapping/'
    }
  ]
}
```

The page footer content can also be customized by editing `src/components/Footer.vue`. The left nav bar logo image is located at `src/assets/logo.svg`, the report page image is located at `src/assets/report.jpg`, and the footer image is located at `src/assets/seals.png`.

A PHP MVP for the contact form would look like this:

```php
<?php
if (isset($_POST['submit'])) {
  $to = "you@email.com";
  $message = "From: " . $_POST['email'] . "\r\n" . $_POST['message'];
  $message = wordwrap($message, 70, "\r\n");
  $headers = 'From: Web Feedback <no-reply@yoursite.org>' . "\r\n";
  mail($to, "Quality of Life Feedback", $message, $headers);
}
?>
```

## Author

👤 **Tobin Bradley**

* Twitter: [@fuzzytolerance](https://twitter.com/fuzzytolerance)
* Github: [@tobinbradley](https://github.com/tobinbradley)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/tobinbradley/quality-of-life-dashboard/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Tobin Bradley](https://github.com/tobinbradley).<br />
This project is [MIT](https://github.com/tobinbradley/quality-of-life-dashboard/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_