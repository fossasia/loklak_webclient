'use strict';

var controllersModule = require('./_index');
var twitterText = require('twitter-text');

controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', '$http', function($rootScope, hello, $http) {

    $rootScope.root.tweet= "";
    $rootScope.root.tweetLength = 140;
    $rootScope.root.userLocation = {};
    $rootScope.root.geoTile;
    console.log($rootScope.root.tweetLength);
    $rootScope.root.postTweet = function() 
    {    
        var message = $rootScope.root.tweet;
        var tweetLen = twttr.txt.getTweetLength(message);
        var tweet = encodeURIComponent(message);
        if(!$rootScope.root.geoTile) {
            if(tweetLen <= 140 && tweetLen > 0) {
                hello('twitter').api('me/share', 'POST', {
                    message : tweet
                });
                $('#myModal').modal('hide');
            }
        }
        else if($rootScope.root.geoTile) {
            if(tweetLen <= 140 && tweetLen > 0) {
                hello('twitter').api('me/share', 'POST', {
                    message : tweet,
                    file : $rootScope.root.geoTile
                });
                $('#myModal').modal('hide');
            }
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

    $rootScope.root.getLocation = function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
        else {
            alert("Geolocation isn't supported by this browser");
        }
    }

    function setPosition(position) {
        $rootScope.root.userLocation.latitude = position.coords.latitude;
        $rootScope.root.userLocation.longitude = position.coords.longitude;
        // Now make a query to loklak
        var requestUrl = 'http://localhost:9000/vis/map.png?text=Test&mlat='+$rootScope.root.userLocation.latitude+'&mlon='+$rootScope.root.userLocation.longitude+'&zoom=13&width=512&height=256';
        $http.get(requestUrl)
            .success(function(response) {
                $rootScope.root.geoTile = response;
                console.log("Successful Query to "+requestUrl);
            });
    }

    $rootScope.root.retweet = function(id) {
        console.log(id);
    }

}]);