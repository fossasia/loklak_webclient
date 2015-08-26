'use strict';
/* global angular, L */
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
				templateEngine: 'genImportedStatus',
				markerType: 'simpleCircle',
				cbOnMapAction: function() {
					console.log('callback');
				}
			});
		},
		link: function(scope, element, attrs) {
			var map = window.map;
			scope.updateMap = function() {
				map.invalidateSize();
				if (scope.markerLayer) {
					map.removeLayer(scope.markerLayer);
				}
				var center = scope.selectedMapMessages[0].location_mark;
				map.panTo(new L.LatLng(center[1], center[0]));
				var mapPoints = MapCreationService.initMapPoints(scope.selectedMapMessages, 'genImportedStatus', scope.selectedMapProfile);
				scope.markerLayer = MapCreationService.addPointsToMap(map, mapPoints, 'simpleCircle', function() {
					console.log("Added succesfully");
				});
				scope.markerLayer.openPopup();
			};
		}
	};
}]);
