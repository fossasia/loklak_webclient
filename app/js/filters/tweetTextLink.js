'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function tweetTextLinkFilter() {
 	return function(input) {
 		var aTag = '<a class="external-link" rel="external" href="$1">#$1</a>';
 		var lastLinkReg = /((https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$)/;
 		return input.replace(lastLinkReg, aTag);
 	};
 }



 filtersModule.filter('tweetTextLink', tweetTextLinkFilter);