'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	service.sourceTypeList =
	{
		'fossasia_api':
		{
			'name': 'Fossasia API',
			'endpoint': 'fossasia.json'
		}
	};

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);