'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
// this should really come from loklak server to stay DRY
function HarvestingFrequencyService(moment) {

	const MAGIC_NUMBER = 2147483647; // max java int

	var service = {};

	service.values =
	[
		{
			'value' : 30
		},
		{
			'value' : 60
		},
		{
			'value' : 180
		},
		{
			'value' : 1440
		},
		{
			'value' : MAGIC_NUMBER
		}
	];

	for (var key in service.values) {
		var value = service.values[key];
		if (value.value === MAGIC_NUMBER) {
			value.label = 'never update';
		} else {
			value.label = moment.duration(value.value, "minutes").humanize();
		}
	}
	console.log(service.values);

	return service;
}

servicesModule.service('HarvestingFrequencyService',['moment', HarvestingFrequencyService]);
