'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("copyLinkModal", ["$rootScope", "$location", "$timeout", function($rootScope, $location, $timeout) {

	return {
		scope: true,
		templateUrl: "copy-link-modal.html",
		controller: function($scope, $element, $attrs) {

			$scope.promptLink = "";
			$rootScope.root.openPromptToCopyLink = function(id) {
				$scope.promptLink = window.location.origin +  "/search?q=id:" + id;
				angular.element(".copy-link-modal").removeClass("hide");
				var input = document.getElementById("link-to-copy-container");
				$timeout(function() {
					input.setSelectionRange(0, input.value.length);
				}, 0);
				input.focus();
			}

			$scope.closeCopyModal = function() {
				angular.element(".copy-link-modal").addClass("hide");
			}
		}
	};
}]);