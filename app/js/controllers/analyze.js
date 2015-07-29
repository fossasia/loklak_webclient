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

 controllersModule.controller('AnalyzeCtrl', ['$rootScope','$http','$scope', function($rootScope,$http,$scope) {

      
     
    //$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
    //$scope.data = [300, 500, 100];
    $http.jsonp("http://localhost:9000/api/account.json?callback=JSON_CALLBACK", {params : { screen_name : "mariobehling", followers : 2000  } })
            .success(function(data, status, headers, config) {
                var topology = data.topology;
                var followerstotal=data.user.followers_count;

                var country_stat_result = {};
                var country_Array=[];
                var followers_follower=[];
                var city_stat_result = {};
                var city_Array=[];
                var top5=[];
                var category1=0;
                var category2=0;
                var category3=0;
                var followerwithloc=0;
                $scope.countryvalues=[];
                $scope.countrylabels=[];
                $scope.cityvalues=[];
                $scope.citylabels=[];
                //Getting citywise Stats
                data.topology.followers.forEach(function(ele){
                    if(ele.location)
                    {   
                        city_Array.push(ele.location);
                        followers_follower.push ({
                            "followers" : ele.followers_count ,
                            "id_str" : ele.id_str,
                            "profileimg" : ele.profile_image_url_https,
                            "screenname" : ele.screen_name,
                            "statuses_count" : ele.statuses_count,
                            "following" : ele.friends_count,
                            "profile_banner" : ele.profile_background_image_url_https

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
                    $scope.cityvalues.push(city_stat_result[ele]);
                    $scope.citylabels.push(ele);
                    
                });
                //console.log("city datauniques are");
                //console.log(citynames);

                //Getting country wise stats
                 data.topology.followers.forEach(function(ele){
                    if(ele.followers_count<200)
                    {
                        category1++;
                    }
                    if(ele.followers_count>200 && ele.followers_count<500)
                    {
                        category2++;
                    }
                    else
                    {
                        category3++;
                    }

                    if(ele.location_country)
                    {   followerwithloc++;
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
               
                countrynames.forEach(function(ele){
                    $scope.countryvalues.push(((country_stat_result[ele]/followerwithloc)*100));
                    $scope.countrylabels.push(ele);
                    
                });
                console.log($scope.countrylabels);
                
               // console.log( city_stat_result);
                $scope.city_stat_result=city_stat_result;
                $scope.country_stat_result=country_stat_result;

                $scope.categorylabels=["O-500" , "500-1000" , "Greater than 1000"];
                $scope.categoryvalues=[category1,category2,category3];
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
      


      


}]);

