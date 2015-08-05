'use strict';
/* global alert, twttr, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var twitterText = require('twitter-text');
// var Editor = require('../components/Editor');

controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', 'FileService', '$http', 'SearchService' , function($rootScope, hello, FileService, $http, SearchService) {

    $rootScope.root.tweet= "";
    $rootScope.root.tweetType = 1;
    $rootScope.root.tweetLength = 140;
    $rootScope.root.userLocation = {};
    $rootScope.root.locationName = "";
    $rootScope.root.VariableLocations = [];
    $rootScope.root.geoTile;
    $rootScope.root.hashtagTrends;
    $rootScope.root.trends = "";
    $rootScope.root.location={};
    $rootScope.root.latitude;
    $rootScope.root.longitude;

    console.log($rootScope.root.tweetLength);
    $rootScope.root.postTweet = function() {

        var message = $rootScope.root.tweet;
        var tweetLen = twttr.txt.getTweetLength(message);
        var tweet = encodeURIComponent(message);
        var latitude = $("#mapLat").val();
        var longitude = $("#mapLng").val();
        var optionChosen = $("#optionChoice").val();

        $rootScope.root.geoTile = $("#fileInput").val();
        console.log($("#fileInput").val());
        console.log($rootScope.root.geoTile);

        console.log("From Post Tweet");
        console.log(latitude);
        console.log(longitude);
        console.log(optionChosen);

        if(!$rootScope.root.geoTile) {
            if (optionChosen === 'mapAttachment') {
                console.log("Map being attached !");
                var requestUrl = 'http://loklak.org/vis/map.png.base64?text='+tweet+'&mlat='+latitude+'&mlon='+longitude+'&zoom=13&width=512&height=256';

                $http({
                    url: requestUrl,
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                }).success(function(response) {

                    var mapBlob = FileService.Base64StrToBlobStr(response);

                    if(tweetLen <= 140 && tweetLen > 0) {
                        hello('twitter').api('me/share', 'POST', {
                            message : message,
                            file : mapBlob
                        }).then(function(json) {
                            console.log(json);
                        }, function(e) {
                            console.log(e);
                        });

                        $('#myModal').modal('hide');

                    }

                    console.log("Blob obtained successfully.");
                });
            }
            else if (optionChosen === 'markdownAttachment') {
                console.log("Markdown Attachment going on here.");

                var tempArr = [];
                for (var i=0; i<= $('.CodeMirror-code').text().length; i+=80) {
                    tempArr.push($('.CodeMirror-code').text().substring(i,i+80));   
                }

                var attachmentText = tempArr.join('\n');
                var encodedMessage = encodeURIComponent(attachmentText);
                var markdownRequestUrl = "http://loklak.org/vis/markdown.png.base64?text="+encodedMessage+"&color_text=000000&color_background=ffffff&padding=3";

                $http({
                    url: markdownRequestUrl,
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                }).success(function(response) {
                    var markdownBlob = FileService.Base64StrToBlobStr(response);
                    console.log("Successfully retrieved for " + markdownRequestUrl);
                    
                    if(tweetLen <= 140 && tweetLen > 0) {
                        hello('twitter').api('me/share', 'POST', {
                            message : message,
                            file : markdownBlob
                        }).then(function(json) {
                            console.log(json);
                        }, function(e) {
                            console.log(e);
                        });

                        $('#myModal').modal('hide');

                    }

                });

            }
            else {

                console.log("Regular Tweet !");

                if(tweetLen <= 140 && tweetLen > 0) {
                    hello('twitter').api('me/share', 'POST', {
                        message : tweet
                    });
                    $('#myModal').modal('hide');
                }

            }
        }
        else if($rootScope.root.geoTile) {
            console.log("Image being attached !");
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

    $rootScope.root.clearLocation = function() {
        $rootScope.root.locationName = "";
    }

    $rootScope.root.setNewLocation = function(newLocation) {
        $rootScope.root.locationName = $rootScope.root.VariableLocations[newLocation];
    }

    // Get the location from the GeoLocation API of HTML5
    $rootScope.root.getLocation = function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
        else {
            alert("Geolocation isn't supported by this browser");
        }
    };

    // Latitude and Longitude is retrieved and the request is made for the map tile
    function setPosition (position) {
        $rootScope.root.userLocation.latitude = position.coords.latitude;
        $rootScope.root.userLocation.longitude = position.coords.longitude;
        // Now make a query to loklak
        var requestUrl = 'http://localhost:9000/vis/map.png.base64?text=Test&mlat='+$rootScope.root.userLocation.latitude+'&mlon='+$rootScope.root.userLocation.longitude+'&zoom=13&width=512&height=256';
        $rootScope.root.location.tile="http://localhost:9000/vis/map.png?text=Test&mlat="+position.coords.latitude+"&mlon="+position.coords.longitude+"&zoom=13&width=512&height=256";

        $("#locationtile").attr("src", $rootScope.root.location.tile);
        $("#locationtile").removeClass('hidden');

        var locationRequestParam = []
        var positionParam = 'Value: '+$rootScope.root.userLocation.latitude+','+$rootScope.root.userLocation.longitude
        locationRequestParam.push(encodeURI(positionParam))
        // Location request parameter attached.
        var locationNameRequest = 'http://localhost:9000/api/geocode.json?callback=JSON_CALLBACK';

        $http.jsonp(locationNameRequest, {
            params: {
                data: {
                    places: [positionParam]
                }
            }
        })
        .success(function(response) {
            console.log(response);
            var keyObject = Object.keys(response.locations);
            var result = response.locations[keyObject].place[0];
            $rootScope.root.VariableLocations = response.locations[keyObject].place;
            $rootScope.root.locationName = result;
        });
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