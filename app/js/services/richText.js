'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function RichTextService() {

	const RICH_TEXT_SEPARATOR = '\n***\n';
	var service = {};

	service.parse = function(text) {
		return text.split(RICH_TEXT_SEPARATOR);
	};

	service.parseJSON = function(text) {
		var splitted = service.parse(text);
		if (splitted.length === 2) {
			return [splitted[0], JSON.parse(splitted[1])];
		} else {
			// doesn't contain rich data
			return [text, null];
		}

	};

	return service;
}

servicesModule.service('RichTextService',RichTextService);
