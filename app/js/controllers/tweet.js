'use strict';

var controllersModule = require('./_index');
var twitterText = require('twitter-text');

controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', 'FileService', '$http', function($rootScope, hello, FileService, $http) {

    $rootScope.root.tweet= "";
    $rootScope.root.tweetLength = 140;
    $rootScope.root.userLocation = {};
    $rootScope.root.geoTile;
    $rootScope.root.hashtagTrends;
    console.log($rootScope.root.tweetLength);
    $rootScope.root.postTweet = function() 
    {    
        var message = $rootScope.root.tweet;
        var tweetLen = twttr.txt.getTweetLength(message);
        var tweet = encodeURIComponent(message);
        $rootScope.root.geoTile = $("#fileInput").val();
        console.log($("#fileInput").val());
        console.log($rootScope.root.geoTile);
        if(!$rootScope.root.geoTile) {
            if(tweetLen <= 140 && tweetLen > 0) {
                hello('twitter').api('me/share', 'POST', {
                    message : tweet
                });
                $('#myModal').modal('hide');
            }
        }
        else if($rootScope.root.geoTile) {
            var selectedFileObj = document.getElementById('fileInput').files[0];
            var selectedFileInBlob;
            var reader  = new FileReader();
            reader.readAsDataURL(selectedFileObj);
            reader.onload = function() {
              selectedFileInBlob = FileService.Base64StrToBlobStr(reader.result.split(",")[1]);
              if(tweetLen <= 140 && tweetLen > 0) {
                  hello('twitter').api('me/share', 'POST', {
                      message : message,
                      file : selectedFileInBlob
                  }).then(function(json) {
                      console.log(json);
                  }, function(e) {
                      console.log(e);
                  });
                  
                  $('#myModal').modal('hide');
              }
            };
           
        }
        else {
            console.log("The tweet doesn't validate as a valid tweet. Reduce the number of characters and try again");
        }
    };

    $rootScope.root.tweetLengthCalculate = function() {
        var tweet = $rootScope.root.tweet;
        $rootScope.root.tweetLength = 140 - twttr.txt.getTweetLength(tweet);
        console.log($rootScope.root.tweetLength);
    }

    // Get the location from the GeoLocation API of HTML5
    $rootScope.root.getLocation = function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
        else {
            alert("Geolocation isn't supported by this browser");
        }
    }

    // Latitude and Longitude is retrieved and the request is made for the map tile
    function setPosition(position) {
        $rootScope.root.userLocation.latitude = position.coords.latitude;
        $rootScope.root.userLocation.longitude = position.coords.longitude;
        // Now make a query to loklak
        var requestUrl = 'http://localhost:9000/vis/map.png?text=Test&mlat='+$rootScope.root.userLocation.latitude+'&mlon='+$rootScope.root.userLocation.longitude+'&zoom=13&width=512&height=256';
        
        $http({
            url: requestUrl,
            method: "GET",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function(response) {
            var selectedFileInBlob = response;
            console.log(response);
            console.log("Successfully retrieved for "+requestUrl);
        });

        // $http.get(requestUrl)
        //     .success(function(response) {
        //         $rootScope.root.geoTile = response;
        //         console.log("Successful Query to "+requestUrl);
        //     });
    }

    $rootScope.root.retweet = function(id) {
        console.log(id);
    }

    $rootScope.root.getHashtagTrends = function() {
        var trendsRequestUrl = 'http://localhost:9000/api/search.json?q=since%3A2015-07-04%20until%3A2015-07-06&source=cache&count=0&fields=hashtags&limit=6';
        $http({
            url: trendsRequestUrl,
            method: 'GET',
            headers : {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .success(function(response) {
            console.log(response);
            $rootScope.root.hashtagTrends = response;
        });
        console.log($rootScope.root.hashtagTrends);
    }

}]);