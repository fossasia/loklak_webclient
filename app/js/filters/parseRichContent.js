'use strict';

var filtersModule = require('./_index.js');
var md = require("markdown");
window.markdown = md.markdown;
/**
 * @ngInject
 */

function parseRichContentFilter() {
	return function(input) {
		 if (input.indexOf("\n***\n") > -1) {
		 	var richPart = input.split("\n***\n")[1];	
		 	console.log(richPart);
		 	return " " +  md.markdown.toHTML(richPart);
		 } else {
		 	return "";
		 }
	};
}


filtersModule.filter('parseRichContent', [parseRichContentFilter]);