'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("addConnectionSettingModal", ["$rootScope", "$location", "$timeout", function($rootScope, $location, $timeout) {

	return {
		restrict: 'A',
		templateUrl: "data-connect/add-connection-setting-modal.html",
		controller: function($scope, $element, $attrs) {
			$scope.closeSettingModal = function() {
				angular.element("#add-connect-setting-modal").css('display', 'none');
				angular.element(".modal-backdrop").remove();
			};
		}
	};
}]);