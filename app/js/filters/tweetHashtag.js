'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 function tweetHashtagFilter() {
 	return function(input) {
 		var aTag = '<a class="external-hashtag" rel="external" href="https://twitter.com/search?q=%23$1">#$1</a>';
 		var hashtagReg = /#([\wäöå]+)/gi;
 		return input.replace(hashtagReg, aTag);
 	};
 }



 filtersModule.filter('tweetHashtag', tweetHashtagFilter);