'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function arraySize() {
 	return function(input) {
 		if (input) {
 			return input.length;
 		} else {
 			return 0;
 		}
 	};
 }



 filtersModule.filter('arraySize', arraySize);