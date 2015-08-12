'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */
 filtersModule.filter('shortenTo', function() {
 	return function(input, limit) {
 		if (!input) {
 			return "";
 		} 

 		if (input.length <= limit) {
 			 return input;
 		}

 		var shortenned = input.substring(0, limit - 3) + "...";
 		return shortenned;
 	};
 });