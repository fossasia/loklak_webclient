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

 controllersModule.controller('AnalyzeCtrl', ['$rootScope','$http','$scope','AppSettings', function($rootScope,$http,$scope,AppSettings) {

      
     $scope.username="loklak_app";
     $scope.getstat=function()
     {
        $('#analyze-modal').modal('hide'); 
     
     
    //$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
    //$scope.data = [300, 500, 100];
    $http.jsonp(AppSettings.apiUrl+"user.json?callback=JSON_CALLBACK", {params : { screen_name :$scope.username, followers : 20000  } })
            .success(function(data, status, headers, config) {
                var topology = data.topology;
                var followerstotal=data.user.followers_count;
                var country_stat_result = {};
                var country_Array=[];
                $scope.followers_follower=[];
                var city_stat_result = {};
                var city_Array=[];
                var top5=[];
                var category1=0;
                var category2=0;
                var category3=0;
                var followerwithloc=0;
                var followerwithcity=0;
                $scope.countryvalues=[];
                $scope.countrylabels=[];
                $scope.cityvalues=[];
                $scope.citylabels=[];
                $scope.citydata=[];
                $scope.countrydata=[];
                //Getting citywise Stats
                data.topology.followers.forEach(function(ele){
                    if(ele.location)
                    {   followerwithcity++;
                        city_Array.push(ele.location);
                        $scope.followers_follower.push ({
                            "followers" : ele.followers_count ,
                            "id_str" : ele.id_str,
                            "name"   : ele.name,
                            "location" : ele.location,
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
                    var percentage=((city_stat_result[ele]/followerwithcity)*100);
                    percentage=Number(percentage).toFixed(2);
                    $scope.citydata.push({
                        "city" : ele ,
                        "followers" : percentage

                    });
                    
                    if(percentage>0.5)
                    {    
                     $scope.cityvalues.push(percentage);
                     $scope.citylabels.push(ele);
                    }
                    
                });
                getTopfive($scope.citydata);
                
                
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
                    var percentage=((country_stat_result[ele]/followerwithloc)*100);
                    percentage=Number(percentage).toFixed(2);
                    $scope.countrydata.push({
                        "country" : ele ,
                        "followers" : percentage

                    });
                    if(percentage>1.5)
                    {    
                        $scope.countryvalues.push(percentage);
                        $scope.countrylabels.push(ele);
                    }
                    
                });
                console.log("countrydtaa");
                $scope.countrydata.sort(function(a, b){return b.followers-a.followers});
                console.log($scope.countrydata);
                
               // console.log( city_stat_result);
                $scope.city_stat_result=city_stat_result;
                $scope.country_stat_result=country_stat_result;

                $scope.categorylabels=["O-500" , "500-1000" , "Greater than 1000"];
                $scope.categoryvalues=[category1,category2,category3];
                getTopfive($scope.followers_follower);
               

                }).error(function(data, status, headers, config) {
                    
                    
                    $scope.followers_status="Load Failed.Twitter did not respond.";
                    

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

