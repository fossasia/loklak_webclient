'use strict';
/* global angular, L, $ */
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

    var vm = this;
    vm.doneReporting = false;
    // Followers & following models
    vm.followers = [];
    vm.following = [];
    vm.showFollowersLimit = 12;
    vm.showFollowingsLimit = 12;
    vm.showAllFollowers = function() {
        vm.showFollowersLimit = $rootScope.userTopology.followers.length;
    };

    vm.showAllFollowings = function() {
        vm.showFollowingsLimit = $rootScope.userTopology.following.length;
    };
    


    viewlanding(); 
    var chart1 = {};
    chart1.type = "GeoChart";
    chart1.data = [
        ['Locale', 'Count', 'Percent'],
        ['Tunisia' , 0 , 0]

    ];

    chart1.options = {
      width: 1024,
      chartArea: {left:10,top:10,bottom:0,width:"100%"},
      colorAxis: {colors: ['#aec7e8', '#1f77b4']},
      displayMode: 'regions'
    };

    chart1.formatters = {
     number : [{
       columnNum: 1,
       pattern: "# #,##0.00 %"
     }]
    };

    $scope.chart = chart1;
    $scope.username = "";
    $scope.influentialfollowers=[];
    var counter=0;
    
     $scope.getstatfollower=function()
     {   
        
        viewloading();
        
        
        $http.jsonp(AppSettings.apiUrl+"user.json?callback=JSON_CALLBACK", {params : { screen_name :$scope.username, followers : 10000, following : 10000, minified: true } })
            .success(function(data, status, headers, config) {
                
                console.log("recieved data");

                if(!data.user)
                {
                    viewnodata();
                    return 0;

                }
                //data about the user analysing
                var topology = data.topology;
                var followerstotal=data.user.followers_count;
                vm.topology = data.topology;
                $scope.followerstotal=data.user.followers_count;
                $scope.followingstotal=data.user.friends_count;
                $scope.name=data.user.name;
                $scope.profilepicurl=data.user.profile_image_url_https;
                $scope.profilebanner=data.user.profile_banner_url;
                $scope.tweetcount=data.user.statuses_count;

                //data about followers
                var country_stat_result = {};
                var country_Array=[];
                $scope.followers_follower=[];
                var city_stat_result = {};
                var city_Array=[];
                var top5=[];
                var followers_category=[0,0,0,0,0,0];
                var followerwithloc=0;
                var followerwithoutloc=0;
                var followerwithoutcity=0;
                var followerwithcity=0;
                var i=0;
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
                            "profile_banner" : ele.profile_banner_url
                            
                        });

                    }
                    else
                    {
                        followerwithoutcity++;
                    }


                });

                //Counting per city
                for(i = 0; i < city_Array.length; ++i) 
                {
                    if(!city_stat_result[city_Array[i]]) {
                        city_stat_result[city_Array[i]] = 0;
                    }
                    ++city_stat_result[city_Array[i]];
                }
                city_stat_result["Unspecified"]= followerwithoutcity;
                var citynames = Object.keys( city_stat_result );

                var totalfollowers=followerwithoutcity+followerwithcity;
                //Populating Data Set
                var cityData=[];
                citynames.forEach(function(ele){
                    var percentage=((city_stat_result[ele]/totalfollowers)*100);
                    percentage=Number(percentage).toFixed(2);
                    $scope.citydata.push({
                        "city" : ele ,
                        "percentage" : percentage ,
                        "followers"  : city_stat_result[ele]

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
                    if(ele.followers_count<100)
                    {
                        followers_category[0]++;
                    }
                    if(ele.followers_count>100 && ele.followers_count<=200)
                    {
                        followers_category[1]++;
                    }
                    if(ele.followers_count>200 && ele.followers_count<=500)
                    {
                        followers_category[2]++;
                    }
                    if((ele.followers_count>500 && ele.followers_count<=1000))
                    {
                        followers_category[3]++;
                    }
                    if((ele.followers_count>1000 && ele.followers_count<=10000))
                    {
                        followers_category[4]++;
                    }
                    if((ele.followers_count>10000))
                    {
                        followers_category[5]++;
                    }

                    if(ele.location_country)
                    {   followerwithloc++;
                        country_Array.push(ele.location_country);
                    }
                    else
                    {
                        followerwithoutloc++;
                    }

                });
                country_stat_result["Unspecified"]= followerwithoutloc;
                //Counting country wise stats
                for(i = 0; i < country_Array.length; ++i) {

                    if(!country_stat_result[country_Array[i]]) {
                        country_stat_result[country_Array[i]] = 0;
                    }
                    ++country_stat_result[country_Array[i]];
                }
               

                var countrynames = Object.keys( country_stat_result );
                
                //Populating Data Set
               var totalfollowerswithcountry=followerwithoutloc+followerwithloc;
                countrynames.forEach(function(ele){
                    var percentage=((country_stat_result[ele]/totalfollowerswithcountry)*100);
                    percentage=Number(percentage).toFixed(2);
                    chart1.data.push(
                        [ele,country_stat_result[ele],percentage]);
                    $scope.countrydata.push({
                        "country" : ele ,
                        "percentage" : percentage,
                        "followers"  : country_stat_result[ele]

                    });
                    if(percentage>1.5)
                    {    
                        $scope.countryvalues.push(percentage);
                        $scope.countrylabels.push(ele);
                    }
                    
                });
             
                $scope.countrydata.sort(function (a, b) { return b.followers-a.followers; });
                
                
               
                $scope.city_stat_result=city_stat_result;
                $scope.country_stat_result=country_stat_result;

                $scope.categorylabels=["<100" ,"100-200", "200-500" ,"500-1000","1000-10000", "> 10000"];
                $scope.categoryvalues=followers_category;
        
                getTopfive($scope.followers_follower);
                var influencers = $scope.followers_follower.length > 150 ? 150 : $scope.followers_follower.length;
                for(counter=0;counter<influencers;counter++)
                {
                    $scope.influentialfollowers.push($scope.followers_follower[counter]);
                }

                $('#loader').hide(); 
                $('#loadmsg').hide();
                $('#inffollowers').show();
                $('#analysis-report').show();

                }).error(function(data, status, headers, config) {
                    
                    
                    
                    $('#loader').hide(); 
                    $('#loadingmessage').hide();
                    $('#loadmsg').show();
                    $('#errormessage').show();

                    
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        function getTopfive(followers_follower){
            function compare(a,b) {
                if (a.followers > b.followers) {
                    return -1;
                }
                if (a.followers < b.followers) {
                    return 1;
                }
                return 0;
            }
            followers_follower.sort(compare);
        }

        vm.doneReporting = true;
};

$scope.increaseLimit = function(){
    var i;
    for(i=counter;i<counter+5;i++)
        {
            $scope.influentialfollowers.push($scope.followers_follower[counter]);
            counter++;
        }
};

$rootScope.$watch(function() 
{
    return $rootScope.root.twitterSession;
},  function(session)
    {
        
        if ($rootScope.root.twitterSession.screen_name)
        {   

            $scope.username=$rootScope.root.twitterSession.screen_name;
            $scope.getstatfollower();
        
        }
        else
        {
            $('#signupModal').modal('show');
        }
    });

      
    function viewlanding() {
        $('#analyze-modal').modal('show');
        $('#loader').hide();
        $('#notfoundmessage').hide();
        $('#loadmsg').hide();
        $('#errormessage').hide();
        $('#analysis-report').hide();
    }

    function viewnodata() {
        $('#loader').hide();
        $('#loadingmessage').hide();
        $('#notfoundmessage').show();
    }

    function viewloading() {
        $('#errormessage').hide();
        $('#notfoundmessage').hide();
        $('#loader').show(); 
        $('#analysis-report').hide();
        $('#inffollowers').hide();
        $('#loadmsg').show();
        $('#loadingmessage').show();  
        
    }

}]);

