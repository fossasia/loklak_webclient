'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	const data =
	{
		'TWITTER': 'Twitter',
		'FOSSASIA_API': 'Fossasia API'
	};

	service.sourceTypeList = [];
	
	for(var key in data) {
		service.sourceTypeList.push(data[key]);
	}

	service.convert = function(key) {
		return data[key];
	}

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);