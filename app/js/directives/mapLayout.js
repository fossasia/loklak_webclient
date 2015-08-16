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
function mapLayoutDirective(MapPopUpTemplateService, $interval, $location, MapCreationService) {

    return {
        scope: {
            data: '=',
        },
        restrict: 'A',
        //replace: true,
        //template : '<p>{{data[0].text}}</p>',
        link: function(scope, element, attrs) {
            var curr = 0;
            var tweetsArrayLength = 20;
            var tweetsArray = [];
            var cycle = attrs.cycletweets;
            var intervalId;
            if (typeof(cycle) == 'undefined' || cycle == null) {
                cycle = false;
            }
            var centerLat = 2.252776;
            var centerLng = 48.845261;
            var zoom = 3;
            var queryParams = $location.search();
            function isValidLat(x){
                //to be added
                return true;
            }
            function isValidLng(x){
                //to be added
                return true;
            }
            function isValidZoom(x){
                //to be added
                return true;
            }
            if(queryParams.lat){
                if(isValidLat(queryParams.lat)){
                    centerLat = queryParams.lat;
                }
            }
            if(queryParams.lng){
                if(isValidLng(queryParams.lng)){
                    centerLng = queryParams.lng;
                }
            }
            if(queryParams.zoom){
                if(isValidZoom(queryParams.zoom)){
                    zoom = queryParams.zoom;
                }
            }
            var map = L.map(attrs.id).setView([centerLat, centerLng], zoom);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'examples.map-20v6611k'
            }).addTo(map);

            map.on('popupopen', function(e) {
                if (cycle == 'true') {
                    var px = map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
                    px.y -= e.popup._container.clientHeight / 2 // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
                    map.panTo(map.unproject(px), {
                        animate: true
                    }); // pan to new center
                }
            });

            map.on('moveend', function(e) {
                var center = map.getCenter();
                var path = $location.path();
                $location.path(path).search({'lat':center.lat,'lng':center.lng,'zoom':map.getZoom()});
            });

            function contains(elem) {
                for (var i = 0; i < tweetsArray.length; i++) {
                    if (tweetsArray[i].id_str == elem.id_str) {
                        return true;
                    }
                };
                return false;
            }
            scope.$watchCollection('data', function() {
                var cleanRun = 0;
                setTimeout(function() {
                    map.invalidateSize();
                }, 1000);

                scope.data.forEach(function(ele) {
                    if (!contains(ele)) {
                        if (ele.location_mark) {
                            //console.log(ele.location_mark);
                            var text = MapPopUpTemplateService.genStaticTwitterStatus(ele);
                            var tweetIcon = L.icon({
                                //iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png'
                                iconUrl: ele.user.profile_image_url_https,
                                iconSize: [30, 30],
                                className: "topologyItem"
                            });
                            var lat = ele.location_mark[1];
                            var lng = ele.location_mark[0];
                            var tempMarker = new L.Marker([lat, lng], {
                                id: ele.id_str,
                                icon: tweetIcon,
                                bounceOnAdd: true
                            });
                            tempMarker.addTo(map);
                            var popup = L.popup({
                                autoPan: false
                            }).setContent("<div class='foobar'>" + text + "</div>");
                            tempMarker.bindPopup(popup);
                            ele.marker = tempMarker;
                            tweetsArray.push(ele);
                        }
                    }
                });
                if (tweetsArray.length > tweetsArrayLength) {
                    for (var i = tweetsArray.length - 1; i >= tweetsArrayLength; i--) {
                        map.removeLayer(tweetsArray[i].marker);
                    };
                    tweetsArray.splice(tweetsArrayLength - 1, tweetsArray.length - tweetsArrayLength);
                }
                if (tweetsArray[0]) {
                    var tempTweetId = tweetsArray[0].id_str;
                    tweetsArray.sort(function(a, b) {
                        if (a.created_at < b.created_at) {
                            return 1;
                        } else if (a.created_at > b.created_at) {
                            return -1;
                        }
                        return 0;
                    });
                    if (tweetsArray[0].id_str != tempTweetId) {
                        curr = 0;
                    }
                }
                setTimeout(function() {
                    tweetsArray[0].marker.openPopup();
                }, 1000);
            });

            scope.$on('$destroy', function() {
                $interval.cancel(intervalId);
            });


            intervalId = $interval(function() {
                if (cycle == 'true') {
                    if (tweetsArray.length > 0) {
                        tweetsArray[curr++].marker.openPopup();
                        if (curr === tweetsArray.length) {
                            curr = 0;
                        }
                    }
                }
            }, 5000);
        }
    };

}

directivesModule.directive('maplayout', ['MapPopUpTemplateService', '$interval', '$location', 'MapCreationService', mapLayoutDirective]);
