'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function LoklakFieldService() {

	var service = {};

	service.fieldList =
	{
		'location_point':
		{
			value: 'location_point',
			label: 'Coordinates',
			help: 'Please enter a field name. The field value will be used to locate the message on Loklak map.'
		},
		'text':
		{
			value: 'text',
			label: 'Message content',
			help: 'Please enter a field name. The field value will show up as message\'s content.'
		}
	};

	// required fields for each source type
	service.sourceTypeFields =
	{
		'geojson': ['text'],
		'fossasia_api': [],
		'nodelist': [],
		'netmon': [],
		'freifunk_node': [],
		'ninux': []
	}

	return service;
}

servicesModule.service('LoklakFieldService',LoklakFieldService);
