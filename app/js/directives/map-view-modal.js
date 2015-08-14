'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("mapViewModal", ['$http', 'MapCreationService', 'SearchService',
function($http, MapCreationService, SearchService) {
	return {
		restrict: 'A',
		templateUrl: "data-connect/map-view-modal.html",
		controller: function($scope, $element, $attrs) {
			MapCreationService.initMap({
				data: [],
				mapId: 'single-data-map',
				templateEngine: 'genStaticTwitterStatus',
				markerType: 'simpleCircle',
				cbOnMapAction: function() {
					console.log('callback');
				}
			});
		},
		link: function(scope, element, attrs) {
			scope.updateMap = function() {
				var mapPoints = MapCreationService.initMapPoints(scope.selectedMapMessages, 'genStaticTwitterStatus');
				MapCreationService.addPointsToMap(window.map, mapPoints, 'simpleCircle', function() {
					console.log("Added succesfully");
				});
			};
		}
	};
}]);
