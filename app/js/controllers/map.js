'use strict';
/* global angular, L */
/* jshint unused:false */

var controllersModule = require('./_index');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var result;
var marker=[];
/**
 * @ngInject
 */

 controllersModule.controller('MapCtrl', ['$rootScope','$http','$scope','HelloService','FollowersMapTemplateService', function($rootScope,$http,$scope,HelloService,FollowersMapTemplateService) {

        var hello=HelloService;
        var followerslayer = new L.LayerGroup();
        var followinglayer = new L.LayerGroup();
        var overlays = {
            "Followers" : followerslayer ,
            "Following" : followinglayer
        };
        $scope.followers={};
        $scope.following={};
        $scope.followers_status="Loading ...";
        $scope.following_status="Loading ..." ;
        
        var grayscale=L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        });
        var basemapObj = {
            "First Basemap": grayscale
        };

        var map = L.map('map',{layers:[grayscale,followerslayer,followinglayer]}).setView([35,34], 2);
        $rootScope.$watch(function() {
            return $rootScope.root.twitterSession;
            }, function(session) {
                if (session) {
                    plotFollowersonMap();
                    plotFollowingOnMap();
                }
            });

         
        
         L.control.layers(basemapObj,overlays).addTo(map);


        function plotFollowersonMap()
        {   
            //defining an object to store followers info
            var followers = [];
            var followers_location = [];
             

            //Marker array
            var followersMarker = {
                "type": "FeatureCollection",
                "features": []
            };            
            //Calling the method to get Twitter followers
            hello('twitter').api('/me/followers', 'GET', {limit : 1000}).then(function(twitterFollowers) {
            $rootScope.$apply(function() 
            {
                twitterFollowers.data.forEach(function(ele){
                    if(ele.location)
                    {   
                        followers_location.push(ele.location);
                        followers.push({
                            "location" : ele.location,
                            "name" : ele.name,
                            "id_str" : ele.id_str,
                            "propic" : ele.profile_image_url_https,
                            "screenname" : ele.screen_name,
                            "followers" : ele.followers_count,
                            "following" : ele.friends_count,
                            "tweetcount" : ele.statuses_count,
                            "profile_banner" : ele.profile_background_image_url_https
                        });
                        

                    }
                });
                $scope.followers=followers;
                Geocode();
            });
            }, function() {
            console.log("Unable to get your followers");
            $scope.followers_status="Load Failed.Twitter did not respond."
            });

            //getting the LatLong 
            function Geocode()
            {
                
                var locarray = {

                    "places" : followers_location
                }

                
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
                //console.log( followers.propic[i]);
                $scope.followers_status=followers_location.length;
                for(var i=0;i<followers_location.length;i++)
                {
                    
                    var locationkey=followers_location[i];
                    if(data.locations[locationkey].mark)
                    {
                    var textpopup=FollowersMapTemplateService.genStaticTwitterFollower(followers , i);
                    console.log("I am viewing "+followers[i].name);
                    //followers.preview[i]=textpopup;
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
                            "popupContent" : "<div class='foobar'><h4>Follower</h4><hr>" + textpopup + "</div>" ,
                            "propic" : followers[i].propic

                        },
                        "id": followers[i].id_str

                    };
                    followersMarker.features.push(pointObject);

                    }
                }
                   add_marker(followersMarker , 1);
                    
                
                }).error(function(data, status, headers, config) {
                    
                    console.log("There is error.Loklak Server did not respond with geodata.We will try again."+data+"fff"+status);
                    $scope.followers_status="Load Failed.Twitter did not respond."
                    
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }
    }  

        function plotFollowingOnMap()
        {

             
            //defining an object to store following info
            var following = [];
            var following_location=[];


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
                        following_location.push(ele.location);
                        following.push({
                            "location" : ele.location,
                            "name" : ele.name,
                            "id_str" : ele.id_str,
                            "propic" : ele.profile_image_url_https,
                            "screenname" : ele.screen_name,
                            "followers" : ele.followers_count,
                            "following" : ele.friends_count,
                            "tweetcount" : ele.statuses_count,
                            "profile_banner" : ele.profile_background_image_url_https,
                            "latesttweet" : ele.status.text
                        });
                        
                    }
                });
                $scope.following=following;
                Geocode_Plot();
            });
            }, function() {
            console.log("Unable to get your following");
            $scope.following_status="Load Failed.Twitter did not respond."
            });

            //getting the LatLong 
            function Geocode_Plot()
            {
                
                var locarray = {

                    "places" : following_location
                }

                
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
                $scope.following_status=following_location.length;
                for(var i=0;i<following_location.length;i++)
                {   
                    var locationkey=following_location[i];
                    if(data.locations[locationkey].mark)
                    {
                    var textpopup=FollowersMapTemplateService.genStaticTwitterFollowing(following , i);
                    //var locationkey=following.location[i];
                    
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
                            "popupContent": "<div class='foobar'><h4>Following</h4><hr>" + textpopup + "</div>",
                            "propic" : following[i].propic
                        },
                        "id": following[i].id_str
                    };
                    followingMarker.features.push(pointObject);
                }

                }
                   add_marker(followingMarker , 0);
                   
                
                }).error(function(data, status, headers, config) {
                    
                    console.log("There is error.Loklak Server did not respond with geodata.We will try again.");
                    $scope.following_status="Load Failed.Twitter did not respond."
                    Geocode_Plot();
                    
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }
        }    

         
        

      function add_marker(result , followerbool) {
                    
                    
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        //console.log(result.features[i].propic-url);
                        var tweetIcon = L.icon({
                        iconUrl: result.features[i].properties.propic ,
                        iconSize:     [30, 30]
                    });
                        var lat = result.features[i].geometry.coordinates[1];
                        var lng = result.features[i].geometry.coordinates[0];
                        marker[i] = new L.Marker([lat, lng], {
                            id: i,
                            icon: tweetIcon
                        });
                        
                        if(followerbool)
                        {
                          marker[i].addTo(followerslayer);  
                        }
                        else
                        {
                            marker[i].addTo(followinglayer);
                        }
                        
                        var popup = L.popup({
                            autoPan: true
                        }).setContent(result.features[i].properties.popupContent);
                        marker[i].bindPopup(popup);
                        
                    }
                    
                }

}]);

