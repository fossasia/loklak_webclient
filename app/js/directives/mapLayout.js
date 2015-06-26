'use strict';

var directivesModule = require('./_index.js');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var widgets = require('../components/widgets');
var bouncemarker = require('../components/bouncemarker');
/**
 * @ngInject
 */
function mapLayoutDirective(MapPopUpTemplateService) {

    return {
        scope: {
            data: '=',
        },
        restrict: 'A',
        //replace: true,
        //template : '<p>{{data[0].text}}</p>',
        link: function(scope, element, attrs) {

            scope.$watch('data', function() {
                
                var marker = [];
                var cleanRun=0;
                var tweets = {
                    "type": "FeatureCollection",
                    "features": []
                };
            scope.data.forEach(function(ele) {
                if (ele.location_point) {
                    var text = MapPopUpTemplateService.genStaticTwitterStatus(ele);
                    var pointObject = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                ele.location_point[0],
                                ele.location_point[1]
                            ]
                        },
                        "type": "Feature",
                        "properties": {
                            "popupContent": "<div class='foobar'>" + text + "</div>"
                        },
                        "id": ele.id_str
                    };
                    tweets.features.push(pointObject);
                }
            });
            if(cleanRun==1){
               clean_slate(marker);
            }
            add_marker(tweets);
            popUpMarker(marker);

            function add_marker(result) {
                var tweetIcon = L.icon({
                    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                });
                console.log(result.features.length);
                var i;
                for (i = 0; i < result.features.length; i++) {
                    console.log("here id ");
                    var lat=result.features[i].geometry.coordinates[1];
                    var lng=result.features[i].geometry.coordinates[0];
                    marker[i] = new L.Marker([lat, lng], {
                        id:i,
                        icon:tweetIcon,
                        bounceOnAdd: true
                    });
                marker[i].addTo(map);
                var popup = L.popup({autoPan : false}).setContent(result.features[i].properties.popupContent);
                marker[i].bindPopup(popup);
                };
                cleanRun=1;
            }
            function clean_slate(marker)
            {   var i;
                for (i = 0; i < marker.length; i++) {
                    //id=this.options.id; 
                    map.removeLayer(marker[i]);
                }
                marker=[];
            }
            function popUpMarker(marker)
            {   var i;
                for (i = 0; i < marker.length; i++) {
                    //id=this.options.id; 
                    marker[i].openPopup();
                }
            }

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

directivesModule.directive('maplayout',['MapPopUpTemplateService',mapLayoutDirective]);
