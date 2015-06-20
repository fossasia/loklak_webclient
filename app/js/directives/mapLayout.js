'use strict';

var directivesModule = require('./_index.js');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
/**
 * @ngInject
 */
function mapLayoutDirective() {

    return {
        scope: {
            data: '=',
        },
        restrict: 'A',
        //replace: true,
        //template : '<p>{{data[0].text}}</p>',
        link: function(scope, element, attrs) {
            scope.$watch('data', function() {
            	console.log(scope.data);
            	var result = GeoJSON.parse(scope.data, {
            	    Point: 'location_point',
            	    include: ['text']
            	});

            	function onEachFeature(layer, feature) {
            	    if (feature.properties && feature.properties.style) {
            	        var popupContent = feature.properties.text[0];

            	        console.log(popupContent + "is");
            	    }
            	}

            	L.geoJson([result], {

            	    style: function(feature) {
            	        return feature.properties && feature.properties.style;
            	    },

            	    onEachFeature: onEachFeature,

            	    pointToLayer: function(feature, latlng) {
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
            }, true);
            var map = L.map(attrs.id).setView([2.252776, 48.845261], 2);
            L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-20v6611k'
            }).addTo(map);
        }
    };

}

directivesModule.directive('maplayout', mapLayoutDirective);
