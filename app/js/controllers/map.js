'use strict';
/* global angular */

var controllersModule = require('./_index');
//var Leaflet = require('angular-leaflet-directive');
var Leaflet = require('../components/leaflet');

/**
 * @ngInject
 */
function MapCtrl($scope, $stateParams, $timeout, $location, $http, AppSettings, SearchService) {
	var map = L.map('map').setView([39.74739, -105], 13);
	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k'
		}).addTo(map);


}

controllersModule.controller('MapCtrl', MapCtrl);