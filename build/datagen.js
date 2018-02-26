const fs = require('fs');
const path = require('path');
const jsonminify = require("jsonminify");
const dataConfig = require('../data/config/data.js');
const siteConfig = require('../data/config/site.js');
const csv = require('csvtojson');
const _ = require('lodash');
const dest = './public/data/metric';
const marked = require('marked');

///////////////////////////////////////////////////
// Create destination folders
///////////////////////////////////////////////////
directoriesToMake = ['data/meta', 'data/metric', 'downloads'];
_.each(siteConfig.geographies, function(geography) {
  directoriesToMake.push('data/metric/' + geography.id);
});
directoriesToMake.forEach((name) => {
  try {
    fs.mkdirSync('public/' + name);
  }
  catch (err) {
    if (err.code !== 'EEXIST') {
      console.log(err);
    }
  }
});

//////////////////////////////////////////////////
// Copy download, geography, style
//////////////////////////////////////////////////

// Either loop through the geography IDs, or just copy geography.geojson.json.
_.each(siteConfig.geographies || ['geography',], function(geography) {
  fs.readFile(`data/${geography.id}.geojson.json`, 'utf8', (err,data) => {
    if (err) return console.log(err.message);
    fs.writeFile(`public/data/${geography.id}.geojson.json`, jsonminify(data), (err) => {
      if (err) return console.log(err.message);
      console.log(`Saved and minified geojson for ${geography.name}`);
    });
    }
  );
});

// Copy data download file.
fs.copyFile('data/download/qol-data.zip', 'public/downloads/qol-data.zip', (err) => {
  if (err) return console.log(err.message);
  console.log("Copied qol-data.zip to downloads");
});

// return true if convertable to number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

////////////////////////////////////////////////
// Process Markdown Meta files into HTML
////////////////////////////////////////////////
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

const src = './data/meta';

fs.readdir(src, (err, files) => {
  if (err) return console.log(err);
  files.forEach((filePath) => {
    fs.readFile(path.join(src, filePath), 'utf-8', (err, data) => {
      if (err) return console.log(err.message);
      let outFile =
          path.join('public/data/meta', path.basename(filePath).split('.')[0]) +
          '.html';

      marked(data, function(err, content) {
        if (err) {
          return console.log(err);
        }
        fs.writeFile(outFile, content, (err) => {
          if (err) return console.log(err.message);
          console.log("Wrote " + outFile);
          }
        );
      });
    });
  });
});

///////////////////////////////////////////////
// CSVtoJSON
///////////////////////////////////////////////

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
  let jsonOut = {};
  for (let i = 0; i < jsonArray.length; i++) {
    jsonOut[jsonArray[i]['id']] = {};
    for (let key in jsonArray[i]) {
      if (key !== 'id') {
        if (isNumeric(jsonArray[i][key])) {
          jsonOut[jsonArray[i]['id']][key] = Number(jsonArray[i][key]);
        } else {
          jsonOut[jsonArray[i]['id']][key] = null;
        }
      }
    }
  }
  return jsonOut;
}

function writeMetricFile(destPath, metric, json) {
  const outFile =  path.join(destPath, `m${metric.metric}.json`);
  return fs.writeFile(
      outFile,
      jsonminify(JSON.stringify(json, null, '  ')),
      (err) => {
        if (err) return console.log(err.message);
        console.log("Wrote " + outFile);
      }
  );
}

function convertMetricCsvToJson(geography, metric) {
  const basePath = path.join('data/metric', geography);
  const destPath = path.join(dest, geography);
  if (metric.type === 'sum' || metric.type === 'mean') {
    const prefix = (metric.type === 'sum' ? 'r' : 'n');
    csv()
    .fromFile(path.join(basePath, `${prefix}${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      outJSON['map'] = jsonTransform(jsonObj);

      if (metric.accuracy) {
        csv()
        .fromFile(path.join(basePath, `m${metric.metric}-accuracy.csv`))
        .on('end_parsed', jsonObj => {
          outJSON['a'] = jsonTransform(jsonObj);
          writeMetricFile(destPath, metric, outJSON);
        })
        .on('error', error => {
          console.log(error);
        });
      } else {
        writeMetricFile(destPath, metric, outJSON);
      }
    })
    .on('error', error => {
      if (error) console.log(error);
    });
  }

  if (metric.type === 'weighted') {
    csv()
    .fromFile(path.join(basePath,`r${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      let jsonArrayR = jsonTransform(jsonObj);

      csv()
      .fromFile(path.join(basePath,`d${metric.metric}.csv`))
      .on('end_parsed', jsonObj => {
        let jsonArrayD = jsonTransform(jsonObj);
        try {
          let key, key2;
          for (key in jsonArrayR) {
            for (key2 in jsonArrayR[key]) {
              if (
                  isNumeric(jsonArrayR[key][key2]) &&
                  isNumeric(jsonArrayD[key][key2])
              ) {
                jsonArrayR[key][key2] =
                    Math.round(
                        jsonArrayR[key][key2] / jsonArrayD[key][key2] * 1000,
                    ) / 1000;
              } else {
                jsonArrayR[key][key2] = null;
              }
            }
          }
        }
        catch (err) {
          console.log("Error on " + metric.metric + " for " + geography);
          return console.log(err);
        }
        outJSON['w'] = jsonArrayD;
        outJSON['map'] = jsonArrayR;
        if (metric.accuracy) {
          csv()
          .fromFile(path.join(basePath,`m${metric.metric}-accuracy.csv`))
          .on('end_parsed', jsonObj => {
            outJSON['a'] = jsonTransform(jsonObj);
            writeMetricFile(destPath, metric, outJSON);
          })
          .on('error', error => {
            if (error) console.log(error);
          });
        } else {
          writeMetricFile(destPath, metric, outJSON);
        }
      })
      .on('error', error => {
        console.log(error);
      });
    })
    .on('error', error => {
      if (error) console.log(error);
    });
  }
}

// Loop through geographies & variables.
_.each(dataConfig, function(metric) {
  if (metric.geographies) {
    _.each(metric.geographies, function(geography) {
      try {
        convertMetricCsvToJson(geography, metric);
      } catch (err) {
        console.log(err);
      }
    });
  }
  else if (metric) {
    convertMetricCsvToJson('', metric);
  }
});
