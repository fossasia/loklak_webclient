'use strict';
/* global angular */

var controllersModule = require('./_index');
var Leaflet = require('angular-leaflet-directive');
var Leaflet_Default = require('../components/leaflet');

/**
 * @ngInject
 */
function MapCtrl($scope, $stateParams, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
     function _init(){
        
        //place the map center to be Nerdeez Offices in Israel
        $scope.center = {
            lat: 32.076884,
            lng: 34.771625,
            zoom: 16
        };
        
        //define mapbox as the map
        $scope.layers = {
            baselayers: {
                mapbox_terrain: {
                    name: 'Mapbox Terrain',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: 'pk.eyJ1IjoidG9tYmF0b3NzYWxzIiwiYSI6Imo3MWxyTHMifQ.TjXg_IV7ZYMHX6tqjMikPg',
                        mapid: 'examples.map-i86nkdio'
                    }
                }
            }
        };
        
        //randomly place markers on the map
        var westLng = 34.770956;
        var eastLng = 34.832754;
        var northLat = 32.098787;
        var southLat = 32.05261;
        var numberOfMarkers = 100;
        $scope.markers = {};
        for(var i = 0; i<numberOfMarkers; i++){
            var randomLng = (Math.random() * (eastLng - westLng) + westLng).toFixed(6);
            var randomLat = (Math.random() * (northLat - southLat) + southLat).toFixed(6);
            $scope.markers['marker_' + i] = {
                lat: parseFloat(randomLat),
                lng: parseFloat(randomLng),
            };
        }
        
        //deal with clustering
        $scope.layers['overlays'] = {
            telaviv: {
                name: "Real world data",
                type: "markercluster",
                visible: true,
                "layerOptions": {
                    "chunkedLoading": true,
                    "showCoverageOnHover": false,
                    "removeOutsideVisibleBounds": true
                }
            }    
        };
        for(var key in $scope.markers){
            $scope.markers[key]['layer'] = 'telaviv';
        }
            
    }
    
    /************************
     * end private section
     ************************/
    
    _init();
   
}

controllersModule.controller('MapCtrl', MapCtrl);