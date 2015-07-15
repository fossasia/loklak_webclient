'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("copyLinkModal", ["$rootScope", function($rootScope) {

	return {
		scope: true,
		templateUrl: "copy-link-modal.html",
		controller: function($scope, $element, $attrs) {
			$rootScope.root.openPromptToCopyLink = function(id) {
				console.log(id);
			}
		}
	};
}]);