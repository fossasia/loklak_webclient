'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function toTrustedFilter($sce) {
	return function(input) {
		 return $sce.trustAsHtml(input);
	};
}


filtersModule.filter('toTrusted', ['$sce', toTrustedFilter]);