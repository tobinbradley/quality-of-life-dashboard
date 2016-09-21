var postcss = require("gulp-postcss"),
    gulp = require("gulp"),
    del = require('del'),
    handlebars = require('handlebars'),
    convert = require('gulp-convert'),
    mkdirp = require('mkdirp'),
    sourcemaps = require("gulp-sourcemaps"),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync'),
    vueify = require('vueify'),
    browserify = require('browserify'),
    markdown = require('gulp-markdown'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    uglify = require('gulp-uglify'),
    nano = require('gulp-cssnano'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    dataConfig = require('./data/config/data.js'),
    siteConfig = require('./data/config/site.js'),
    selectGroups = require('./data/config/selectgroups.js');


gulp.task('datagen', ['clean', 'markdown', 'csv2json', 'transform']);
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['css', 'js', 'template', 'imagemin', 'move']);

// template
gulp.task('template', function(cb) {
    mkdirp('./public/', function() {
        var categories = [];
        _.each(dataConfig, function(el) {
            if (categories.indexOf(el.category) === -1) { categories.push(el.category); }
        });

        var source = fs.readFileSync('./app/index.html', 'utf-8').toString();
        var data = {
            cachebuster: Math.floor((Math.random() * 100000) + 1),
            siteConfig: siteConfig,
            dataConfig: dataConfig,
            categories: categories,
            header: siteConfig.header,
            selectgroups: selectGroups
        };

        handlebars.registerHelper('ifEither', function(v1, v2, options) {
            if(v1 !== null || v2 !== null) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        var template = handlebars.compile(source);
        var html = template(data);
        fs.writeFileSync(path.join('./public/', 'index.html'), html);
        cb();
    });
});

// css
gulp.task("css", function() {
    return gulp.src(['./app/css/main.css'])
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require("postcss-import")(),
            require("postcss-nested"),
            require("autoprefixer")({
                'browers': ['last 2 version']
            })
        ]))
        .pipe(gutil.env.type === 'production' ? nano() : gutil.noop())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'));
});

// js
gulp.task('js', function () {
    _.each(['main.js'], function(file) {
        browserify(`./app/js/${file}`)
          .transform(vueify)
          .transform(babelify)
          .bundle()
          .pipe(source(file))
          .pipe(buffer())
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
          .on('error', gutil.log)
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('./public/js/'));
    });
});


// browser-sync
gulp.task('browser-sync', function() {
    browserSync(['./public/**/*'], {
        server: {
            baseDir: "./public"
        }
    });
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./app/*.html'], ['template']);
    gulp.watch(['./app/css/**/*.css'], ['css']);
    gulp.watch(['./app/js/*.js', './app/js/modules/*.js', './app/js/components/*.vue'], ['js']);
    gulp.watch('./app/img/**/*', ['imagemin']);
});

// images
gulp.task('imagemin', function() {
    return gulp.src('./app/img/*')
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest('public/img'));
});

// move
gulp.task('move', function(cb) {
    gulp.src('./app/fonts/*.*')
        .pipe(gulp.dest('./public/fonts/'));
    gulp.src('./data/geography.geojson.json')
        .pipe(gulp.dest('./public/data/'));
    gulp.src('./data/gl-style/**/*')
            .pipe(gulp.dest('./public/style/'));

    cb();
});

////////////////////////////////////////////////
// data processing
///////////////////////////////////////////////

// clean junk before build
gulp.task('clean', function(cb) {
    del([
        'public/data/meta/*.html',
        'public/data/metric/*.json',
        'tmp/*.json'
    ], cb());
});

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

// csv to jxon
gulp.task('csv2json', ['clean'], function() {
    return gulp.src('data/metric/*.csv')
        .pipe(convert({
            from: 'csv',
            to: 'json'
        }))
        .pipe(gulp.dest('tmp/'));
});

// convert/move json files
gulp.task('transform', ['clean', 'csv2json'], function(cb) {
    var dest = "./public/data/metric";
    mkdirp(dest);

    _.each(dataConfig, function(m) {
        if (m.type === "sum") {
            let r = require('./tmp/r' + m.metric + '.json');
            let outJSON= {};
            outJSON["map"] = jsonTransform(r);
            if (m.accuracy) {
                var a = require('./tmp/m' + m.metric + '-accuracy.json');
                outJSON["a"] = jsonTransform(a);
            }
            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
        }
        if (m.type === "mean") {
            var n = require('./tmp/r' + m.metric + '.json');
            let outJSON= {};
            outJSON["map"] = jsonTransform(n);
            if (m.accuracy) {
                let a = require('./tmp/m' + m.metric + '-accuracy.json');
                outJSON["a"] = jsonTransform(a);
            }
            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
        }
        if (m.type === "weighted") {
            let outJSON= {};
            if (m.accuracy) {
                var a = require('./tmp/m' + m.metric + '-accuracy.json');
                outJSON['a'] = jsonTransform(a);
            }
            let r = require('./tmp/r' + m.metric + '.json');
            let d = require('./tmp/d' + m.metric + '.json');
            var jsonArrayR = jsonTransform(r);
            var jsonArrayD = jsonTransform(d);
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
            fs.writeFileSync(path.join(dest, `m${m.metric}.json`), JSON.stringify(outJSON, null, '  '));
        }
    });
    del(['./tmp/**']);
    cb();
});

// markdown
gulp.task('markdown', ['clean'], function() {
    return gulp.src('data/meta/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('public/data/meta/'));
});
