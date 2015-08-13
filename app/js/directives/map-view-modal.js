'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("mapViewModal", ['$http', 'MapCreationService',
function($http, MapCreationService) {
	return {
		restrict: 'A',
		templateUrl: "data-connect/map-view-modal.html",
		controller: function($scope, $element, $attrs) {
			MapCreationService.initMap({
				data: null,
				mapId: 'single-data-map',
				templateEngine: 'genStaticTwitterStatus',
				markerType: 'simpleCircle',
				cbOnMapAction: function() {
					console.log('callback');
				}
			});
		}
	};
}]);
