'use strict';
/* global L */
/* jshint unused:false */

var directivesModule = require('./_index.js');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var bouncemarker = require('../components/bouncemarker');
/**
 * @ngInject
 */
function mapLayoutDirective(MapPopUpTemplateService, $interval) {

    return {
        scope: {
            data: '=',
        },
        restrict: 'A',
        //replace: true,
        //template : '<p>{{data[0].text}}</p>',
        link: function(scope, element, attrs) {
            var curr = 0;
            var marker = [];

            function contains(marker, elem) {
                for (var m in marker) {
                    if (m.id === elem.id_str) {
                        return true;
                    }
                }
                return false;
            }
            scope.$watch('data', function() {


                var cleanRun = 0;
                var tweets = {
                    "type": "FeatureCollection",
                    "features": []
                };
                scope.data.forEach(function(ele) {
                    if (!contains(marker, ele)) {
                        if (ele.location_mark) {
                            var text = MapPopUpTemplateService.genStaticTwitterStatus(ele);
                            var pointObject = {
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [
                                        ele.location_mark[0],
                                        ele.location_mark[1]
                                    ]
                                },
                                "type": "Feature",
                                "properties": {
                                    "popupContent": "<div class='foobar'>" + text + "</div>"
                                },
                                "id": ele.id_str
                            };
                            tweets.features.push(pointObject);
                            var tweetIcon = L.icon({
                                iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                            });
                            var lat = pointObject.geometry.coordinates[1];
                            var lng = pointObject.geometry.coordinates[0];
                            var tempMarker = new L.Marker([lat, lng], {
                                id: pointObject.id,
                                icon: tweetIcon,
                                bounceOnAdd: true
                            });
                            tempMarker.addTo(map);
                            var popup = L.popup({
                                autoPan: false
                            }).setContent(pointObject.properties.popupContent);
                            tempMarker.bindPopup(popup);
                            marker.push(tempMarker);
                        }
                    }
                });
                if (cleanRun === 1) {
                    clean_slate(marker);
                }
                //add_marker(tweets);
                //popUpMarker(marker);

                function add_marker(result) {
                    var tweetIcon = L.icon({
                        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                    });
                    console.log(result.features.length);
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        console.log("here id ");
                        var lat = result.features[i].geometry.coordinates[1];
                        var lng = result.features[i].geometry.coordinates[0];
                        marker[i] = new L.Marker([lat, lng], {
                            id: i,
                            icon: tweetIcon,
                            bounceOnAdd: true
                        });
                        marker[i].addTo(map);
                        var popup = L.popup({
                            autoPan: false
                        }).setContent(result.features[i].properties.popupContent);
                        marker[i].bindPopup(popup);
                    }
                    cleanRun = 1;
                }

                function clean_slate(marker) {
                        var i;
                        for (i = 0; i < marker.length; i++) {
                            //id=this.options.id; 
                            map.removeLayer(marker[i]);
                        }
                        marker = [];
                    }
                    // function popUpMarker(marker)
                    // {   var i;
                    //     for (i = 0; i < marker.length; i++) {
                    //         //id=this.options.id; 
                    //         marker[i].openPopup();
                    //     }
                    // }


            }, true);
            var map = L.map(attrs.id).setView([2.252776, 48.845261], 2);
            L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-20v6611k'
            }).addTo(map);

            $interval(function() {
                if (marker.length > 0) {
                    marker[curr++].openPopup();
                    if (curr === marker.length) {
                        curr = 0;
                    }
                }
            }, 5000);
        }
    };

}

directivesModule.directive('maplayout', ['MapPopUpTemplateService', '$interval', mapLayoutDirective]);
