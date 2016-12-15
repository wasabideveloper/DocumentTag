"use strict";

let Path = require('path');
let FS = require('fs');

let Barrier = require("./barrier");


module.exports = class FileAnalyzer {
	constructor(startDirectory, log) {
		this.tagLibrary = {};
		this.startDirectory = startDirectory;
		this.log = log;
	}

	regexMatch(pattern, text) {
		var matches = [];
		var match;
		while (match = pattern.exec(text)) {
			matches.push(match[0]);
		}
		return matches;
	}

	tagFile(file, tags) {
		tags.forEach((tag) => {
			if (!this.tagLibrary[tag]) {
				this.tagLibrary[tag] = [];
			}
			this.tagLibrary[tag].push(file);
		});
	}

	findFileNameTags(fileName) {
		let tags = [];
		const fileTags = [
			{ symbol: '@', regex: /@(\w|\d)*/ig },
			{ symbol: '+', regex: /\+(\w|\d)*/ig }
		];
		fileTags.forEach((tag) => {
			if(fileName.indexOf(tag.symbol) >= 0) {
				let foundTags = this.regexMatch(tag.regex, fileName).map(
					(match) => match.replace(tag.symbol,'')
				);
				tags = tags.concat(foundTags);
			}
		});
		if (/^(\d{6}|\d{4})/ig.exec(fileName)) {
			tags.push(`⌚ ${fileName.substring(0,2)}/${fileName.substring(2,4)}`);
		}
		return tags;
	}

	analyzeDirectory(path, parentTags, log, barrier) {
		FS.readdir(path, (error, items) => {
			if (error) {
				log(error);
			} else {
				barrier.expand(items.length);
				items.forEach((file) => {
					let absoluteFilePath = Path.join(path, file);
					FS.stat(absoluteFilePath, (error, meta) => {
						if (error) {
							log(error);
						} else {
							if (meta.isDirectory()) {
								this.analyzeDirectory(
									absoluteFilePath,
									parentTags.concat([file.toLowerCase()]),
									log,
									barrier
								);
							} else if (meta.isFile()) {
								let fileTags = parentTags.concat(this.findFileNameTags(file));
								if (fileTags.length > 0) {
									this.tagFile(absoluteFilePath, fileTags);
								}
								barrier.finishedTask(absoluteFilePath);
							}
						}
					});
				});
			}
			barrier.finishedTask(path);
		});
	}

	analyze(callback) {
		let barrier = new Barrier(1).then(
			() => { callback(this.tagLibrary); }
		);
		this.analyzeDirectory(this.startDirectory, [], this.log, barrier);
	}
}
