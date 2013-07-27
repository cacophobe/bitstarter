#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};
var cheerioHtmlUrl = function(htmldata) {
	return cheerio.load(htmldata);
};
var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(htmldata, checksfile) {
	$ = htmldata;
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json')
		.option('-f, --file <html_file>', 'Path to index.html')
		.option('-u, --url <html_url>', 'Url to fetch')
		.parse(process.argv);

	if(program.checks) {
		if(fs.existsSync(program.file)) {
			var checkJson = checkHtml(cheerioHtmlFile(program.file), program.checks);
			var outJson = JSON.stringify(checkJson, null, 4);
			console.log(outJson);
		}
		if(program.url) {
			restler.get(program.url).on('complete', function(result) {
				var checkJson = checkHtml(cheerioHtmlUrl(result), program.checks);
				var outJson = JSON.stringify(checkJson, null, 4);
				console.log(outJson);
			});
		}
	}	
} else {
	console.log("error: check your arguments and try again");
	exports.checkHtml = checkHtml;
}
