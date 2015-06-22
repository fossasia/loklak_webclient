'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 filtersModule.filter('tweetTextLink', function() {
 	return function(input) {
 		var aTag = '<a class="external-link" rel="external" href="$1">$1</a>';
 		var lastLinkReg = /((http)\S+)/gi;
 		return input.replace(lastLinkReg, aTag);
 	};
 });