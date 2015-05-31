'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function tweetMentionFilter() {
	return function(input) {
		var mentionReg = /@([\wäöå]+)/gi;
		var aTag = '<a rel="external" href="https://twitter.com/$1">@$1</a>';
		return input.replace(mentionReg, aTag);
	};
}


filtersModule.filter('tweetMention', tweetMentionFilter);