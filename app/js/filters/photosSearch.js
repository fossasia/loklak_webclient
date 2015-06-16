'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function photosSearchFilter() {
 	return function(input) {
 		return input.filter(function(ele) {
 			return (ele.images_count !== 0);
 		});
 	};
 }



 filtersModule.filter('photosSearch', photosSearchFilter);