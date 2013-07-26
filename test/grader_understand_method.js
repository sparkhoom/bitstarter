#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var util = require('util');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlContent = function(htmlContent) {
    return cheerio.load(htmlContent);
};

var getFileContent = function(filename){
    fs.readFile(filename, function(err, data) {
        if (err) {
            console.error('Error: ' + err);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        } else {
            return data;
        }
    });

}
var getUrlContent = function(url){
    restler.get(url).on('complete',function(result, response){
        if (result instanceof Error){
            console.error('Error: ' + util.format(response.message));
            process.exit(1);
        }
        else {
            return result;
        }
    });
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlContent, checksfile) {
    $ = cheerioHtmlContent(htmlContent);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <check_url>', 'Path to URL')
        .parse(process.argv);


    //console.log(htmlContent);
    if( undefined !== program.url){
        console.log(program.url);
        var htmlContent = cheerioHtmlContent(getUrlContent(program.url));
    }
    else {
        var htmlContent = cheerioHtmlContent(getFileContent(program.file));
    }
    console.log(htmlContent.html());

    var checkJson = checkHtmlFile(htmlContent, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
