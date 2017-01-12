let handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    dataConfig = require('../data/config/data.js'),
    siteConfig = require('../data/config/site.js'),
    selectGroups = require('../data/config/selectgroups.js');


// var source = fs.readFileSync('./app/index.html', 'utf-8').toString();
// var data = {
//     cachebuster: Math.floor((Math.random() * 100000) + 1)
// };

// var template = handlebars.compile(source);
// var html = template(data);
// fs.writeFileSync(path.join('./public/', 'index.html'), html);



var source = fs.readFileSync('./app/index.html', 'utf-8').toString();
var data = {
    cachebuster: Math.floor((Math.random() * 100000) + 1),
    siteConfig: siteConfig,
    selectgroups: selectGroups
};

handlebars.registerHelper('ifEither', function(v1, v2, options) {
    if(v1 !== null || v2 !== null) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper('whatsnew', function(id, options) {
    return new handlebars.SafeString(dataConfig[`m${id}`].title);
});

var template = handlebars.compile(source);
var html = template(data);
fs.writeFileSync(path.join('./public/', 'index.html'), html);