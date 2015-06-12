'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function liveSearchFilter() {
 	return function(input) {
 		return input;
 	};
 }



 filtersModule.filter('liveSearch', liveSearchFilter);