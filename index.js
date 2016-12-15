"use strict";

let Handlebars = require('handlebars');
let Path = require('path');
let FS = require('fs');
var Open = require("open");

let FileAnalyzer = require("./file-analyzer");

let processArgs = process.argv.slice(2);
let startDirectory = processArgs[0] || Path.join((process.env.HOME || process.env.USERPROFILE), 'Documents');
let outFile = processArgs[1] || Path.join('/tmp', 'fileAnalyzerResult.html');
let log = console.error;

let TemplateRenderer = Handlebars.compile(FS.readFileSync(Path.join(__dirname, 'template.hbs'), 'utf8'));
let fileAnalyzer = new FileAnalyzer(startDirectory, log);
fileAnalyzer.analyze((tags) => {
	let context = {
		tags: Object.keys(tags)
			.map((key) => {
				return { tag: key, files: tags[key] }
			})
			.sort((a,b) => (a.tag == b.tag) ? 0 : ((a.tag < b.tag) ? -1 : 1))
	};
	let html = TemplateRenderer(context);
	FS.writeFile(outFile, html, { encoding: 'utf8', flag: 'w' }, function(error) {
		if(error) {
			log(error);
		} else {
			Open(outFile);
		}
	});
});
