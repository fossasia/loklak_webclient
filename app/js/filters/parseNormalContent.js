'use strict';

var filtersModule = require('./_index.js');
/**
 * @ngInject
 */

function parseNormalContentFilter() {
	return function(input) {
	 	return input.split("\n***\n")[0];
	};
}


filtersModule.filter('parseNormalContent', [parseNormalContentFilter]);
