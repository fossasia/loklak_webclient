'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	service.sourceTypeList = 
	[
		'IMPORT',
		'USER'
	];

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);