'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function LoklakFieldService() {

	var service = {};

	service.fieldList =
	[
		'screen_name',
		'latitude',
		'longitude',
		'text'
	];

	return service;
}

servicesModule.service('LoklakFieldService',LoklakFieldService);
