'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function JsonFieldAccessorService() {

	var service = {};
	// support "deep" field accessing : field is location.lat => result = json[location][lat]
	service.accessField = function(json, field) {
		if (!json) {
			return '';
		}
		var dotPos = field.indexOf(".");
		if (dotPos === -1) {
			if (json[field]) {
				return json[field];
			} else {
				return '';
			}
		}
		var firstPart = field.substr(0, dotPos);
		var secondPart = field.substr(dotPos+1);
		return service.accessField(json[firstPart], secondPart);
	};

	return service;
}

servicesModule.service('JsonFieldAccessorService', JsonFieldAccessorService);
