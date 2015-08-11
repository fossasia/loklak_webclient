'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function LoklakFieldService() {

	var service = {};

	service.fieldList =
	[
		{
			value: 'screen_name',
			label: 'Username'
		},
		{
			value: 'latitude',
			label: 'Latitude'
		},
		{
			value: 'longitude',
			label: 'Longitude'
		},
		{
			value: 'text',
			label: 'Message content'
		}
	];

	return service;
}

servicesModule.service('LoklakFieldService',LoklakFieldService);
