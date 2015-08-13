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
			SearchService.initData("/source_type=TWITTER").then(function(data) {
				MapCreationService.initMap({
					data: data.statuses,
					mapId: 'single-data-map',
					templateEngine: 'genStaticTwitterStatus',
					markerType: 'simpleCircle',
					cbOnMapAction: function() {
						console.log('callback');
					}
				});
			}, function() {});
		}
	};
}]);
