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
			label: 'Username',
			help: 'The field name that matches message\'s owner username.'
		},
		{
			value: 'location_point',
			label: 'Coordinates',
			help: 'The field name that matches to message\'s coordinates, in the following format [lon,lat]. Message\' coordinates are used to locate the message on loklak map'
		},
		{
			value: 'text',
			label: 'Message content',
			help: 'Tthe field name that matches to message\'s text. This is the actual content of the message'
		}
	];

	return service;
}

servicesModule.service('LoklakFieldService',LoklakFieldService);
