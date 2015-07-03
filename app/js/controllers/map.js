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
         plotFollowingOnMap();


        function plotFollowersonMap()
        {   
            //defining an object to store followers info
            var followers = {
                "location" : [],
                "name" : [],
                "id_str" : [],
                "propic" : []
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
                        followers.propic.push(ele.profile_image_url_https);
    
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
                //console.log( followers.propic[i]);
                
                for(var i=0;i<followers.location.length;i++)
                {
                    
                    var locationkey=followers.location[i];
                    if(data.locations[locationkey].mark)
                    {
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
                            "popupContent" : followers.name[i]+" is following you" ,
                            "propic" : followers.propic[i]

                        },
                        "id": followers.id_str[i]

                    };
                    followersMarker.features.push(pointObject);

                    }
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
    }  

        function plotFollowingOnMap()
        {
             
            //defining an object to store following info
            var following = {
                "location" : [],
                "name" : [],
                "id_str" : [],
                "propic" : []
            };

            //Marker array
            var followingMarker = {
                "type": "FeatureCollection",
                "features": []
            };
            
            //Calling the method to get Twitter followings
            hello('twitter').api('/me/following', 'GET').then(function(twitterfollowing) {
            $rootScope.$apply(function() 
            {
                twitterfollowing.data.forEach(function(ele){
                    if(ele.location)
                    {
                        following.location.push(ele.location);
                        following.name.push(ele.name);
                        following.id_str.push(ele.id_str);
                        following.propic.push(ele.profile_image_url_https)
                    }
                });
               
                Geocode_Plot();
            });
            }, function() {
            console.log("Unable to get your following");
            });

            //getting the LatLong 
            function Geocode_Plot()
            {
                
                var locarray = {
                    "places" : following.location
                }
                console.log(locarray);
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
                console.log(data);
                for(var i=0;i<following.location.length;i++)
                {   
                    var locationkey=following.location[i];
                    if(data.locations[locationkey].mark)
                    {
                    //var locationkey=following.location[i];
                    console.log(locationkey);
                    console.log(data);
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
                            "popupContent": "You follow " + following.name[i],
                            "propic" : following.propic[i]
                        },
                        "id": following.id_str[i]
                    };
                    followingMarker.features.push(pointObject);
                }

                }
                   add_marker(followingMarker);
                  console.log(data);      
                
                }).error(function(data, status, headers, config) {
                    console.log(following.places);
                    console.log("There is error");
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }
        }    

         
        

      function add_marker(result) {
                    
                    console.log(result.features.length);
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        //console.log(result.features[i].propic-url);
                        var tweetIcon = L.icon({
                        iconUrl: result.features[i].properties.propic ,
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

