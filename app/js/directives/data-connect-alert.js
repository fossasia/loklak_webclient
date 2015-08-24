'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("dataConnectAlert", ['$http',
function($http) {
	return {
		restrict: 'A',
		scope: {
			messages: '=',
			setMessageView: '&'
		},
		templateUrl: "data-connect/data-connect-alert.html",
		link: function(scope, element, attrs) {
			scope.clearData = function() {
				scope.messages = {};
			};
			scope.setViewData = function(profile) {
				scope.setMessageView({profile: profile});
			};
		}
	};
}]);
