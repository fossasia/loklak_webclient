'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	service.sourceTypeList = 
	[
		'TWITTER',
		'FOSSASIA_API'
	];

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);