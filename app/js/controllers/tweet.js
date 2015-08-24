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
        var maplongWest = $("#maplongWest").val();
        var maplatSouth = $("#maplatSouth").val();
        var maplongEast = $("#maplongEast").val();
        var maplatNorth = $("#maplatNorth").val();
        var optionChosen = $("#optionChoice").val();
        var mapZoomLevel = $("#mapZoomLevel").val();
        var crossPOSTURLbase = 'http://localhost:9000/api/push.json?data=';

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
                var bboxURLPart = '&bbox='+maplongWest+','+maplatSouth+','+maplongEast+','+maplatNorth;
                var requestUrl = 'http://loklak.org/vis/map.png.base64?text='+tweet+'&mlat='+latitude+'&mlon='+longitude+bboxURLPart+'&zoom='+mapZoomLevel+'&width=512&height=256';

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
                            lat: latitude,
                            long: longitude,
                            file : mapBlob
                        }).then(function(json) {
                            console.log(json);
                        }, function(e) {
                            console.log(e);
                        });
                        $rootScope.root.tweet= "";
                        $("#optionChoice").attr('value',"");
                        $('#myModal').modal('hide');

                    }

                    console.log("Blob obtained successfully.");
                });
            }
            else if (optionChosen === 'markdownAttachment') {
                console.log("Markdown Attachment going on here.");
                var lines =  $('.CodeMirror-code > pre')
                var tempArr = [];

                for (var line = 0; line < lines.length; line++) {
                    tempArr.push(lines[line].textContent);
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
                            lat: latitude,
                            long: longitude,
                            file : markdownBlob
                        }).then(function(json) {
                            console.log(json);
                        }, function(e) {
                            console.log(e);
                        });
                        $rootScope.root.tweet= "";
                        $("#optionChoice").attr('value',"");
                        $('#myModal').modal('hide');

                    }

                });

            }
            else {

                console.log("Regular Tweet !");
                var pushObject = {};

                if(tweetLen <= 140 && tweetLen > 0) {

                    hello('twitter').api('me/share', 'POST', {
                        message : tweet,
                        lat: latitude,
                        long: longitude,
                    }).then(function(json) {
                        console.log(json);
                        // The Push service should send the data to be cross posted to loklak server
                        var dateString = json.created_at;
                        var convertedDate = new Date(dateString);
                        var ISODate = convertedDate.toISOString();
                        pushObject['created_at'] = ISODate;
                        pushObject['screen_name'] = json.user.screen_name;
                        pushObject['text'] = json.text;
                        pushObject['canonical_id'] = json.id_str;
                        pushObject['source_type'] = "TWITTER";
                        var dataObject = {};
                        dataObject['statuses'] = [pushObject];
                        var paramString = JSON.stringify(dataObject);
                        var crossPostRequest = crossPOSTURLbase + paramString;

                        // Making the post request

                        $http.post(crossPostRequest)
                        .then(function() {
                            console.log('Successfully Cross posted to loklak');
                        });
                        // End of post request
                    }, function (e) {
                        console.log(e);
                    });
                    $rootScope.root.tweet= "";
                    $("#optionChoice").attr('value',"");
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
                      lat: latitude,
                      long: longitude,
                      file : selectedFileInBlob
                  }).then(function(json) {
                      console.log(json);
                  }, function(e) {
                      console.log(e);
                  });
                  $rootScope.root.tweet= "";
                  $("#optionChoice").attr('value',"");
                  $("#fileInput").val("");
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

}]);