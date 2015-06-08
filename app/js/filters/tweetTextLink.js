'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function tweetTextLinkFilter() {
 	return function(input) {
 		var aTag = '<a class="external-link" rel="external" href="$1">#$1</a>';
 		var lastLinkReg = /(http[\wäöå]+)/;
 		return input.replace(lastLinkReg, aTag);
 	};
 }



 filtersModule.filter('tweetTextLink', tweetTextLinkFilter);