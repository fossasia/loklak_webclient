'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("retweetModal", ["$rootScope", function($rootScope) {

	return {
		templateUrl: "retweet-modal.html",
		controller: function($scope, $element, $attrs) {
		}
	};
}]);