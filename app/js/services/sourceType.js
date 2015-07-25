'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SourceTypeService() {

	var service = {};

	service.sourceTypeList =
	{
		'twitter':
		{
			'name': 'Twitter',		// display name
			'endpoint': null
		},
		'fossasia_api':
		{
			'name': 'Fossasia API',
			'endpoint': 'fossasia.json'
		}
	};

	return service;
}

servicesModule.service('SourceTypeService',[SourceTypeService]);