'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function capitalizeFilter() {
 	return function(input) {
 		var strArray = input.split('');
 		strArray[0] = strArray[0].toUpperCase();
 		return strArray.join('');
 	};
 }



 filtersModule.filter('capitalize', capitalizeFilter);