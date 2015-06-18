'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

 filtersModule.filter('tweetHashtag', function () {
 	return function(input) {
 		var currentHost = location.host;
 		var aTag = '<a class="external-hashtag" ng-click="root.goToSearch(\'#$1\')" rel="external" href="./search?q=%23$1">#$1</a>';
 		var hashtagReg = /#([\wäöå]+)/gi;
 		return input.replace(hashtagReg, aTag);
 	};
 });