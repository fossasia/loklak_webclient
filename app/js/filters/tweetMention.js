'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function tweetMentionFilter() {
	return function(input) {
		input = input.replace('</a>', '');
		var mentionReg = /\B\@([\S\-]+)/gim;
		var aTag = '<a class="external-mention" rel="external" href="./search?q=%40$1">@$1</a>';
		return input.replace(mentionReg, aTag);
	};
}


filtersModule.filter('tweetMention', tweetMentionFilter);
