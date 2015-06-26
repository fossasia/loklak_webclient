'use strict';

var directivesModule = require('./_index.js');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var widgets = require('../components/widgets');
var bouncemarker = require('../components/bouncemarker');
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
                var result = GeoJSON.parse(scope.data, {Point: 'location_point' , include:['id_str']}); 
                console.log(result.features[0]);
                //clean_slate(); will develop if required to remove the earlier markers
                add_marker(result);
                 
                function add_marker(result) {
                    var tweetIcon = L.icon({
                        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                    });
                    console.log(result.features.length);
                    var marker = [];
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        console.log("here id ");
                        var lat=result.features[i].geometry.coordinates[1];
                        var lng=result.features[i].geometry.coordinates[0];
                        marker[i] = new L.Marker([lat, lng], {
                            id: result.features[i].properties.id_str,
                            icon:tweetIcon,
                            bounceOnAdd: true
                        });
                    marker[i].addTo(map);

                     var customOptions =
                    {
                        'maxWidth': '500px',
                        'className' : 'custom'
                    }   
                    var popup="<div id='TweetBox'></div>";
                    marker[i].bindPopup(popup,customOptions);
                    marker[i].on('click', showTweet);
                    };
                }

          
                function showTweet(e){   
                    document.getElementById('TweetBox').innerHTML="";
                    var id=this.options.id; 
                    twttr.widgets.createTweet(id,
                    document.getElementById('TweetBox'),{
                        theme: 'light'
                    }
                    );
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

directivesModule.directive('maplayout', mapLayoutDirective);
