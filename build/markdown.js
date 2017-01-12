// Convert markdown files to html
// had an odd problem with files encoded as utf-8. Reencoding as ascii fixed the problem.

// for i in *.md
// do
//     if [[ $(enca -L none "$i") != *ASCII* ]]; then
//         iconv -c -f  UTF-8 -t ISO-8859-1 "$i" -o "$i.utf8"
//         mv "$i.utf8" "$i"
//     fi
// done

var marked = require('marked');
var fs = require( 'fs' );
var path = require( 'path' );

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});

var src = "./data/meta";
var dest = "public/data/meta";

var _getAllFilesFromFolder = function(dir) {
    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {
        file = path.join(dir, file);
        var stat = filesystem.statSync(file);
        if (stat && stat.isDirectory() && path.extname(file) === ".md") {
            results = results.concat(_getAllFilesFromFolder(file))
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
        let outFile = path.join(dest, path.basename(files[i]).split('.')[0]) + '.html';

        marked(data, function(err, content){
            if (err) {
                return console.log(err);
            }
            fs.writeFileSync(outFile, content);
        });
    });
}
