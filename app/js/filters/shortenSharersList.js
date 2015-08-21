'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function shortenSharersList() {
 	return function(input) {
 		var text = '';
 		if (input && input.length >= 2) {
 			text = 'Shared by' + input[0] + ', ' + input[1];
 			if (input.length > 2) {
	 			if (input.length === 3) {
	 				text += ' and 1 other';
	 			} else {
	 				text += ' and ' + (input.length -1) + 'others';
	 			}
 			}
 		} else if (input && input.length > 0) {
 			text = 'Shared by ' + input[0];
 		} else {
 			text = '0 share';
 		}
 		return text;
 	};
 }



 filtersModule.filter('shortenSharersList', shortenSharersList);