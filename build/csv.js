////////////////////////////////////////////////
// data processing
////////////////////////////////////////////////

var fs = require('fs');
var path = require('path');
var dataConfig = require('../data/config/data.js');
const csv = require('csvtojson');
const _ = require('lodash');


// return true if convertable to number
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
    var jsonOut = {};
    for (var i = 0; i < jsonArray.length; i++) {
        jsonOut[jsonArray[i]["id"]] = {};
        for (var key in jsonArray[i]) {
            if (key !== 'id') {
                if (isNumeric(jsonArray[i][key])) {
                    jsonOut[jsonArray[i]["id"]][key] = Number(jsonArray[i][key]);
                } else {
                    jsonOut[jsonArray[i]["id"]][key] = null;
                }
            }
        }
    }
    return jsonOut;
}

var dest = "./public/data/metric";

_.each(dataConfig, function(m) {
    if (m.type === "sum") {
        csv()
            .fromFile('data/metric/r' + m.metric + '.csv')
            .on('end_parsed', (jsonObj)=>{
                let outJSON= {};
                outJSON["map"] = jsonTransform(jsonObj);

                if (m.accuracy) {
                    csv()
                        .fromFile('data/metric/m' + m.metric + '-accuracy.csv')
                        .on('end_parsed', (jsonObj)=>{
                            outJSON["a"] = jsonTransform(jsonObj);
                            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));                      
                        })
                        .on('done',(error)=>{
                            if (error) console.log(error);
                        });
                } else {
                    fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  ')); 
                }                            
            })
            .on('done',(error)=>{
                if (error) console.log(error);
            });
    }
    if (m.type === "mean") {
        csv()
            .fromFile('data/metric/n' + m.metric + '.csv')
            .on('end_parsed', (jsonObj)=>{
                let outJSON= {};
                outJSON["map"] = jsonTransform(jsonObj);

                if (m.accuracy) {
                    csv()
                        .fromFile('data/metric/m' + m.metric + '-accuracy.csv')
                        .on('end_parsed', (jsonObj)=>{
                            outJSON["a"] = jsonTransform(jsonObj);
                            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));                      
                        })
                        .on('done',(error)=>{
                            if (error) console.log(error);
                        });
                } else {
                    fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  ')); 
                }                            
            })
            .on('done',(error)=>{
                if (error) console.log(error);
            });
    }
    if (m.type === "weighted") {
        csv()
            .fromFile('data/metric/r' + m.metric + '.csv')
            .on('end_parsed', (jsonObj)=>{
                let outJSON= {};
                let jsonArrayR = jsonTransform(jsonObj);

                csv()
                    .fromFile('data/metric/d' + m.metric + '.csv')
                    .on('end_parsed', (jsonObj)=>{
                        var jsonArrayD = jsonTransform(jsonObj);
                        for (key in jsonArrayR) {
                            for (key2 in jsonArrayR[key]) {
                                if (isNumeric(jsonArrayR[key][key2]) && isNumeric(jsonArrayD[key][key2])) {
                                    jsonArrayR[key][key2] = Math.round((jsonArrayR[key][key2] / jsonArrayD[key][key2]) * 1000) / 1000;
                                } else {
                                    jsonArrayR[key][key2] = null;
                                }
                            }
                        }
                        outJSON["w"] = jsonArrayD;
                        outJSON["map"] = jsonArrayR;
                        if (m.accuracy) {
                            csv()
                                .fromFile('data/metric/m' + m.metric + '-accuracy.csv')
                                .on('end_parsed', (jsonObj)=>{
                                    outJSON["a"] = jsonTransform(jsonObj);
                                    fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));                      
                                })
                                .on('done',(error)=>{
                                    if (error) console.log(error);
                                });
                        } else {
                            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  ')); 
                        }     

                    })
                    .on('done',(error)=>{
                        if (error) console.log(error);
                    });                                          
            })
            .on('done',(error)=>{
                if (error) console.log(error);
            });                
    }
});





// // csv to jxon
// gulp.task('csv2json', ['clean'], function() {
//     return gulp.src('data/metric/*.csv')
//         .pipe(convert({
//             from: 'csv',
//             to: 'json'
//         }))
//         .pipe(gulp.dest('tmp/'));
// });

// // convert/move json files
// gulp.task('transform', ['clean', 'csv2json'], function(cb) {
//     var dest = "./public/data/metric";
//     mkdirp(dest, function() {
//         _.each(dataConfig, function(m) {
//             if (m.type === "sum") {
//                 let r = require('./tmp/r' + m.metric + '.json');
//                 let outJSON= {};
//                 outJSON["map"] = jsonTransform(r);
//                 if (m.accuracy) {
//                     var a = require('./tmp/m' + m.metric + '-accuracy.json');
//                     outJSON["a"] = jsonTransform(a);
//                 }
//                 fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
//             }
//             if (m.type === "mean") {
//                 var n = require('./tmp/n' + m.metric + '.json');
//                 let outJSON= {};
//                 outJSON["map"] = jsonTransform(n);
//                 if (m.accuracy) {
//                     let a = require('./tmp/m' + m.metric + '-accuracy.json');
//                     outJSON["a"] = jsonTransform(a);
//                 }
//                 fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
//             }
//             if (m.type === "weighted") {
//                 let outJSON= {};
//                 if (m.accuracy) {
//                     var a = require('./tmp/m' + m.metric + '-accuracy.json');
//                     outJSON['a'] = jsonTransform(a);
//                 }
//                 let r = require('./tmp/r' + m.metric + '.json');
//                 let d = require('./tmp/d' + m.metric + '.json');
//                 var jsonArrayR = jsonTransform(r);
//                 var jsonArrayD = jsonTransform(d);
//                 for (key in jsonArrayR) {
//                     for (key2 in jsonArrayR[key]) {
//                         if (isNumeric(jsonArrayR[key][key2]) && isNumeric(jsonArrayD[key][key2])) {
//                             jsonArrayR[key][key2] = Math.round((jsonArrayR[key][key2] / jsonArrayD[key][key2]) * 1000) / 1000;
//                         } else {
//                             jsonArrayR[key][key2] = null;
//                         }
//                     }
//                 }
//                 outJSON["w"] = jsonArrayD;
//                 outJSON["map"] = jsonArrayR;
//                 fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
//             }
//         });
//         del(['./tmp/**']);
//         cb();

//     });


// });

// // markdown
// gulp.task('markdown', ['clean'], function() {
//     return gulp.src('data/meta/*.md')
//         .pipe(markdown())
//         .pipe(gulp.dest('public/data/meta/'));
// });