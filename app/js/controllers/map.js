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

    controllersModule.controller('MapCtrl', ['$rootScope','$http', 'HelloService', function($rootScope,$http,hello) {


        
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
                console.log(followers);
                Geocode();
            });
            }, function() {
            console.log("Unable to get your followers");
            });

            //getting the LatLong 
            function Geocode()
            {
                console.log("I am called");
                var locarray = {
                    "places" : followers.location
                }
                console.log(locarray);
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {

                
                for(var i=0;i<followers.location.length;i++)
                {
                    var locationkey=followers.location[i];
                    //console.log(data.locations[locationkey].mark);
                    var pointObject = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                data.locations[locationkey].mark[0],
                                data.locations[locationkey].mark[1]
                            ]
                        },
                        "type": "Feature",
                        "properties": {
                            "popupContent": followers.name[i]
                        },
                        "id": followers.id_str[i]
                    };
                    followersMarker.features.push(pointObject);

                }
                   add_marker(followersMarker);
                  console.log(data);      
                
                }).error(function(data, status, headers, config) {
                    console.log(followers.places);
                    console.log("There is error");
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }


            
            

            //getting followers location

          
            
            
           
         

        }  

        function plotFollowingOnMap()
        {
             var followings = {
                "location" : [],
                "name" : [],
                "id_str" : []
            };

            //Marker array
            var followingMarker = {
                "type": "FeatureCollection",
                "features": []
            };
            
            //Calling the method to get Twitter followers
            hello('twitter').api('/me/following', 'GET').then(function(twitterFollowing) {
            $rootScope.$apply(function() 
            {
                twitterFollowing.data.forEach(function(ele){
                    if(ele.location)
                    {
                        followings.location.push(ele.location);
                        followings.name.push(ele.name);
                        followings.id_str.push(ele.id_str);
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
                params: {location: followings.location}
            }).success(function(data, status, headers, config) {

                followings.location.forEach(function(ele){

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
                    followingMarker.features.push(pointObject);

                });
                        
                
                }).error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                });

        }    

         
        

      function add_marker(result) {
                    
                    console.log(result.features.length);
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        var tweetIcon = L.icon({
                        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-32.png',
                    });
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

