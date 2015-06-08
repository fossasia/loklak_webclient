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
		var tweets = {
    "type": "FeatureCollection",
    "features": [
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9998241,
                    39.7471494
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "Hi I am the first Tweet to Pop Up. Many others to follow!!"
            },
            "id": 51
        },
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9983545,
                    39.7502833
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "Cool! I am the second Tweet.Currently we are being plotted from a locally hosted geoJSON.Soon.."
            },
            "id": 52
        },
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9963919,
                    39.7444271
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "I am the third tweet!Soon we will be plotted from a real time generated geoJSON from the loklak server.Isn't it interesting? ;)"
            },
            "id": 54
        },
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9960754,
                    39.7498956
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "Fourth tweet says:Yes Quite! It will be fun to see tweets pop up on a map!"
            },
            "id": 55
        },
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9933717,
                    39.7477264
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "Ola people I am the 5th one! Just saying Hi!"
            },
            "id": 57
        },
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9913392,
                    39.7432392
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "Hey Tweets! I am your developer!"
            },
            "id": 58
        }
    ]
};
		

		function onEachFeature(feature, layer) {
			
			if (feature.properties && feature.properties.popupContent) {
				var popupContent = feature.properties.popupContent;
			}

			layer.bindPopup(popupContent);
		}

		L.geoJson([tweets], {

			style: function (feature) {
				return feature.properties && feature.properties.style;
			},

			onEachFeature: onEachFeature,

			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 8,
					fillColor: "#ff7800",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			}
		}).addTo(map);


		



}

controllersModule.controller('MapCtrl', MapCtrl);