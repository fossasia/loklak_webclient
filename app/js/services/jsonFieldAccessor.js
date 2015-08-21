'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function JsonFieldAccessorService() {

	var service = {};
	// support "deep" field accessing : field is location.lat => result = json[location][lat]
	service.accessField = function(json, field) {
		var dotPos = field.indexOf(".");
		if (dotPos === -1) {
			return json[field];
		}
		var firstPart = field.substr(0, dotPos);
		var secondPart = field.substr(dotPos+1);
		return service.accessField(json[firstPart], secondPart);
	}

	return service;
}

servicesModule.service('JsonFieldAccessorService', JsonFieldAccessorService);
