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
			'key': 'FOSSASIA_API',
			'name': 'Fossasia API',
			'endpoint': 'fossasia.json'
		}
	};

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);