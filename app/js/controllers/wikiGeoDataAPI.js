/**
 *  Wiki GeoData API
 *  https://www.mediawiki.org/wiki/Extension:GeoData#API
 *  By Jigyasa Grover, jig08
 */

'use strict';
/* global angular, L, map */
/* jshint unused:false */

var controllersModule = require('./_index');
/**
 * @ngInject
 */

controllersModule.controller('WikiGeoDataController', ['$scope', '$http', '$sce', function($scope, $http, $sce) {

			/*
				Returns pageIDs of articles around the given point (determined either by coordinates and radius).
				The wiki article can then be accessed by https://en.wikipedia.org/?curid=<pageID>
			*/

            $scope.wikiGeoData = function() {               

                var baseURL = 'https://en.wikipedia.org/w/api.php?';
                var lat; //Lattitude of the place
                var lon; //Longitude of the place
                var radius = 1000;
                var QueryCommand = baseURL + "action=query&prop=info&list=geosearch&gscoord=" + lat + "|" + lon + "&gsradius=" + radius + "format=json";

                $http.get(String(QueryCommand)).then(function(response) {
                    console.log(response.data.query.geosearch[0].pageid);
                    $scope.geoData = response.data.geosearch;

                    for (var i = 0; i < $scope.geoData.length; ++i) {
                        $scope.geoData[i].pageid = $sce.trustAsHtml($scope.geoData[i].pageid);
                    }
                    
                    /*
                    	The wiki article can then be accessed by https://en.wikipedia.org/?curid=<pageID>
                    */
                });

            }

        }]);
