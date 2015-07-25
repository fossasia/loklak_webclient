'use strict';
/* global alert, twttr, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var twitterText = require('twitter-text');

controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', 'FileService', '$http', 'SearchService' , function($rootScope, hello, FileService, $http, SearchService) {

    $rootScope.root.tweet= "";
    $rootScope.root.tweetLength = 140;
    $rootScope.root.userLocation = {};
    $rootScope.root.geoTile;
    $rootScope.root.hashtagTrends;
    $rootScope.root.trends = "";
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
    };

    // Get the location from the GeoLocation API of HTML5
    $rootScope.root.getLocation = function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
        else {
            alert("Geolocation isn't supported by this browser");
        }
    };

    // Converts base 64 string to arrayBuffer
    function _base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Converts an array buffer to base64 strings
    function _arrayBufferToBase64(uarr) {
        var strings = [], chunksize = 0xffff;
        var len = uarr.length;

        for (var i = 0; i * chunksize < len; i++) {
            strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
        }
        return strings.join("");
    }

    // Latitude and Longitude is retrieved and the request is made for the map tile
    function setPosition(position) {
        $rootScope.root.userLocation.latitude = position.coords.latitude;
        $rootScope.root.userLocation.longitude = position.coords.longitude;
        // Now make a query to loklak for the map tile from the GeoLocation
        var requestUrl = 'http://localhost:9000/vis/map.png.base64?text=Loklak&mlat='+$rootScope.root.userLocation.latitude+'&mlon='+$rootScope.root.userLocation.longitude+'&zoom=13&width=512&height=256';
        
        $http({
            url: requestUrl,
            method: "GET",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function(response) {

            var message = $rootScope.root.tweet;
            var tweetLen = twttr.txt.getTweetLength(message);
            var tweet = encodeURIComponent(message);

            var selectedFileInBlob = FileService.Base64StrToBlobStr(response);

            hello('twitter').api('me/share', 'POST', {
                message : message,
                file : selectedFileInBlob
            }).then(function(json) {
                console.log(json);
            }, function(e) {
                console.log(e);
            });

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
    };

    $rootScope.root.getHashtagTrends = function() {

        function getMonth(monthStr){
            return new Date(monthStr+'-1-01').getMonth()+1
        }

        var hashtagData = [];
        var queryString = '';
        var currentDate = new Date();
        var untilDate = currentDate.toString();
        var untilElements = untilDate.split(' ');
        var untilMonthValue = ('0'+getMonth(untilElements[1])).slice(-2);
        var untilDateString = 'until:'+untilElements[3]+'-'+untilMonthValue+'-'+('0'+untilElements[2]).slice(-2);
        console.log(untilDateString);
        var sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate()-20);
        var sinceDay = ('0' + sinceDate.getDate()).slice(-2);
        var sinceMonth = ('0' + (sinceDate.getMonth()+1)).slice(-2);
        var sinceYear = sinceDate.getFullYear();

        var sinceDateString = 'since:'+sinceYear+'-'+sinceMonth+'-'+sinceDay+' ';

        queryString = sinceDateString+untilDateString;
        console.log(queryString);

        var params = {
            q: queryString,
            source: 'cache',
            count: 0,
            fields: 'hashtags',
            limit: 6
        };

        SearchService.initData(params).then(function(data) {
                   hashtagData = hashtagData.concat(data.aggregations.hashtags);
                   $rootScope.root.trends = hashtagData[0];
            }, function() {

            });
    };

    $rootScope.root.getHashtagTrends();
}]);