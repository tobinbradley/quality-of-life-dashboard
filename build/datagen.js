var fs = require('fs');
var path = require('path');
var dataConfig = require('../data/config/data.js');
var siteConfig = require('../data/config/site.js');
const csv = require('csvtojson');
const _ = require('lodash');
var dest = './public/data/metric';
var marked = require('marked');
var shell = require('shelljs');

///////////////////////////////////////////////////
// Create destination folders
///////////////////////////////////////////////////
shell.mkdir('-p', 'public/data/meta');
shell.mkdir('-p', 'public/data/metric');
_.each(siteConfig.geographies, function(geography) {
  shell.mkdir('-p', 'public/data/metric/' + geography.id);
});
shell.mkdir('-p', 'public/downloads');

//////////////////////////////////////////////////
// Copy download, geography, style
//////////////////////////////////////////////////
if (siteConfig.geographies) {
  _.each(siteConfig.geographies, function(geography) {
    shell.cp(`data/${geography.id}.geojson.json`, 'public/data/');
  });
}
else {
  shell.cp('data/geography.geojson.json', 'public/data/');
}
shell.cp('data/download/qol-data.zip', 'public/downloads/');

// return true if convertable to number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

////////////////////////////////////////////////
// Markdown
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

var src = './data/meta';

var _getAllFilesFromFolder = function(dir) {
  var filesystem = require('fs');
  var results = [];

  filesystem.readdirSync(dir).forEach(function(file) {
    file = path.join(dir, file);
    var stat = filesystem.statSync(file);
    if (stat && stat.isDirectory() && path.extname(file) === '.md') {
      results = results.concat(_getAllFilesFromFolder(file));
    } else results.push(file);
  });
  return results;
};

let files = _getAllFilesFromFolder(src);

for (let i = 0; i < files.length; i++) {
  fs.readFile(files[i], 'utf-8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    let outFile =
      path.join('public/data/meta', path.basename(files[i]).split('.')[0]) +
      '.html';

    marked(data, function(err, content) {
      if (err) {
        return console.log(err);
      }
      fs.writeFileSync(outFile, content);
    });
  });
}

///////////////////////////////////////////////
// CSVtoJSON
///////////////////////////////////////////////

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
  var jsonOut = {};
  for (var i = 0; i < jsonArray.length; i++) {
    jsonOut[jsonArray[i]['id']] = {};
    for (var key in jsonArray[i]) {
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

function csvToJson(geography, metric) {
  let basePath = path.join('data/metric', geography);
  let destPath = path.join(dest, geography);

  if (metric.type === 'sum') {
    csv()
    .fromFile(path.join(basePath, `r${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      outJSON['map'] = jsonTransform(jsonObj);

      if (metric.accuracy) {
        csv()
        .fromFile(path.join(basePath, `m${metric.metric}-accuracy.csv`))
        .on('end_parsed', jsonObj => {
          outJSON['a'] = jsonTransform(jsonObj);
          fs.writeFileSync(
              path.join(destPath, `m${metric.metric}.json`),
              JSON.stringify(outJSON, null, '  '),
          );
        })
        .on('done', error => {
          if (error) console.log(error);
        });
      } else {
        fs.writeFileSync(
            path.join(destPath, `m${metric.metric}.json`),
            JSON.stringify(outJSON, null, '  '),
        );
      }
    })
    .on('done', error => {
      if (error) console.log(error);
    });
  }
  if (metric.type === 'mean') {
    csv()
    .fromFile(path.join(basePath, `n${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      outJSON['map'] = jsonTransform(jsonObj);

      if (metric.accuracy) {
        csv()
        .fromFile(path.join(basePath, `m${metric.metric}-accuracy.csv`))
        .on('end_parsed', jsonObj => {
          outJSON['a'] = jsonTransform(jsonObj);
          fs.writeFileSync(
              path.join(destPath, `m${metric.metric}.json`),
              JSON.stringify(outJSON, null, '  '),
          );
        })
        .on('done', error => {
          if (error) console.log(error);
        });
      } else {
        fs.writeFileSync(
            path.join(destPath, `m${metric.metric}.json`),
            JSON.stringify(outJSON, null, '  '),
        );
      }
    })
    .on('done', error => {
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
        var jsonArrayD = jsonTransform(jsonObj);
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
        outJSON['w'] = jsonArrayD;
        outJSON['map'] = jsonArrayR;
        if (metric.accuracy) {
          csv()
          .fromFile(path.join(basePath,`m${metric.metric}-accuracy.csv`))
          .on('end_parsed', jsonObj => {
            outJSON['a'] = jsonTransform(jsonObj);
            fs.writeFileSync(
                path.join(destPath, `m${metric.metric}.json`),
                JSON.stringify(outJSON, null, '  '),
            );
          })
          .on('done', error => {
            if (error) console.log(error);
          });
        } else {
          fs.writeFileSync(
              path.join(destPath, `m${metric.metric}.json`),
              JSON.stringify(outJSON, null, '  '),
          );
        }
      })
      .on('done', error => {
        if (error) console.log(error);
      });
    })
    .on('done', error => {
      if (error) console.log(error);
    });
  }
}



// Loop through geographies & variables.
_.each(dataConfig, function(metric) {
  if (metric.geographies) {
    _.each(metric.geographies, function(geography) {
      csvToJson(geography, metric);
    });
  }
  else {
    csvToJson('', metric);
  }
});
