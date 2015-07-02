'use strict';
/* global angular */

var controllersModule = require('./_index');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var result;
var marker=[];
/**
 * @ngInject
 */

    controllersModule.controller('MapCtrl', ['$rootScope', 'HelloService', function($rootScope, hello) {


        
        var map = L.map('map').setView([2.252776,48.845261], 3);

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        }).addTo(map);
    
         plotFollowersonMap();
        // plotFollowingonMap();


        function plotFollowersonMap()
        {   
            //defining an object to store followers info
            var followers = {
                "location" : [],
                "name" : [],
                "id_str" : []
            };

            //Marker array
            var followersMarker = {
                "type": "FeatureCollection",
                "features": []
            };
            
            //Calling the method to get Twitter followers
            hello('twitter').api('/me/followers', 'GET').then(function(twitterFollowers) {
            $rootScope.$apply(function() 
            {
                twitterFollowers.data.forEach(function(ele){
                    if(ele.location)
                    {
                        followers.location.push(ele.location);
                        followers.name.push(ele.name);
                        followers.id_str.push(ele.id_str);
                    }
                });
            });
            }, function() {
            console.log("Unable to get your followers");
            });

            //getting the LatLong 
            
            $http({
                url: user.details_path, 
                method: "GET",
                params: {location: followers.location}
            }).success(function(data, status, headers, config) {

                followers.location.forEach(function(ele){

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
                    followersMarker.features.push(pointObject);

                });
                        
                
                }).error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                });

            



            
            

            //getting followers location

          
            
            
           // add_marker(followersMarker);
         

        }  

        function plotFollowingOnMap()
        {
            hello('twitter').api('/me/following', 'GET').then(function(twitterFollowers) {
            $rootScope.$apply(function() {
                console.log(twitterFollowing);
                //$rootScope.root.twitterFollowers = twitterFollowers; 
                });
            }, function() {
            console.log("Unable to get your followers");
            });
            
            

            //getting followers location

          var following = {
                "type": "FeatureCollection",
                "features": []
            };
            response.statuses.forEach(function(ele) {
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
                    following.features.push(pointObject);
                }
            });

            
         //   add_marker(tweets);

        }    

         
        

      function add_marker(result) {
                    var tweetIcon = L.icon({
                        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                    });
                    console.log(result.features.length);
                    var i;
                    for (i = 0; i < result.features.length; i++) {
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
                    };
                    
                }

}]);

