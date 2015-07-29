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

        var map = L.map('map',{layers:[grayscale,followerslayer,followinglayer]}).setView([20,0], 2);
        $rootScope.$watch(function() {
            return $rootScope.root.twitterSession;
            }, function(session) {
                if (session) {
                    plotFollowersonMap();
                    plotFollowingOnMap();
                }
            });

         stats();
        
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
             
          
                //console.log( followers.propic[i]);      
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
      function stats()
      {
        console.log("stats being called");
        $http.jsonp("http://localhost:9000/api/account.json?callback=JSON_CALLBACK", {params : { screen_name : "mariobehling", followers : 2000  } })
            .success(function(data, status, headers, config) {
                var topology = data.topology;
                var country_stat_result = {};
                var country_Array=[];
                var followers_follower=[];
                var city_stat_result = {};
                var city_Array=[];
                var top5=[];
                
                //Getting citywise Stats
                data.topology.followers.forEach(function(ele){
                    if(ele.location)
                    {
                        city_Array.push(ele.location);
                        followers_follower.push ({
                            "followers" : ele.followers_count ,
                            "id_str" : ele.id_str

                        });

                    }

                });

                //Counting per city
                for(var i = 0; i < city_Array.length; ++i) 
                {
                    if(!city_stat_result[city_Array[i]])
                    city_stat_result[city_Array[i]] = 0;
                    ++city_stat_result[city_Array[i]];
                }
                var citynames = Object.keys( city_stat_result );

                //Populating Data Set
                var cityData=[];
                citynames.forEach(function(ele){
                    cityData.push(
                    {
                         value: city_stat_result[ele],
                         color:"#F7464A",
                         highlight: "#FF5A5E",
                         label: ele
                    })
                });
                //console.log("city datauniques are");
                //console.log(citynames);

                //Getting country wise stats
                 data.topology.followers.forEach(function(ele){
                    if(ele.location_country)
                    {
                        country_Array.push(ele.location_country);
                    }

                });

                 //Counting country wise stats
                for(var i = 0; i < country_Array.length; ++i) {

                    if(!country_stat_result[country_Array[i]])
                    country_stat_result[country_Array[i]] = 0;
                    ++country_stat_result[country_Array[i]];
                }

                var countrynames = Object.keys( country_stat_result );
                
                //Populating Data Set
                var countryData=[];
                countrynames.forEach(function(ele){
                    countryData.push(
                    {
                         value: country_stat_result[ele],
                         color:"#F7464A",
                         highlight: "#FF5A5E",
                         label: ele
                    })
                });
                
                
               // console.log( city_stat_result);
                $scope.city_stat_result=city_stat_result;
                $scope.country_stat_result=country_stat_result;
                getTopfive(followers_follower);
               

                }).error(function(data, status, headers, config) {
                    
                    
                    $scope.followers_status="Load Failed.Twitter did not respond.";
                    /*followers_location.push(ele.location);
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
*/
console.log("error"+status);
                    
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        function getTopfive(followers_follower){
            function compare(a,b) {
                if (a.followers > b.followers)
                    return -1;
                if (a.followers < b.followers)
                    return 1;
                return 0;
            }
            followers_follower.sort(compare);
            console.log(followers_follower);
        }
      


      }


}]);

