'use strict';
/* global angular */

var controllersModule = require('./_index');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var tweets,result;

/**
 * @ngInject
 */
function MapCtrl($scope, $stateParams, $timeout, $location, $http, AppSettings, SearchService) {


        
        var map = L.map('map').setView([2.252776,48.845261], 9);

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        }).addTo(map);
    
         $http.jsonp( "http://loklak.org/api/search.json?callback=JSON_CALLBACK&timezoneOffset=-330&q=/location")
         .success(function (response) {
            tweets = response.statuses;
            result = GeoJSON.parse(tweets, {Point: 'location_point' , include:['text']}); 
            console.log(result);
           function onEachFeature(layer,feature) {
                if (feature.properties && feature.properties.style) {
                    var popupContent = feature.properties.text[0];

                    console.log(popupContent+"is");
                    }
                }

        L.geoJson([result], {

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

        });
          


}

controllersModule.controller('MapCtrl', MapCtrl);
