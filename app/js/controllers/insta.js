'use strict';
/* global angular, L */
/* jshint unused:false */

var controllersModule = require('./_index');
var result;
var startupslocation=[];
var marker=[];
var plotted=0;
/**
 * @ngInject
 */

 controllersModule.controller('InstaCtrl', ['$rootScope','$location','$http','$scope','AppSettings','MapPopUpTemplateService', function($rootScope,$location,$http,$scope,AppSettings,MapPopUpTemplateService) {
  


  var totalpage=0;
  var currentpage=0;
  $scope.photos=[];
  var photoslayer = new L.LayerGroup();
  var overlays = {
            "photos" : photoslayer 
        };
  var grayscale=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        });
        var basemapObj = {
            "First Basemap": grayscale
        };
      var url="https://api.instagram.com/v1/users/self/feed?callback=JSON_CALLBACK&count=20&access_token=";
      var map2 =L.map('map2',{layers:[grayscale,photoslayer]}).setView([20,0], 2);
      var access_token;
      var query = window.location.href;
      var vars = query.split("#");
      var pairs=vars[1].split("=");
      access_token=pairs[1];
      url=url+access_token;
      var i=0;
      getData(url,1);
      

    


  $scope.curr_page=0;
  $scope.lastpage;
     function getData(url,i)
    { 

      $http.jsonp(url).then(function(response)
      {   
         var picdata=response.data.data;
         picdata.forEach(function(ele){
          if(ele.location)
          {
            if(ele.location.latitude)
            { 
              console.log(ele);
              $scope.photos.push(ele);
            }
          }
         });

        url=response.data.pagination.next_url; 
        console.log(url);
        plotOnMap();
        if(i<20)
        {
          i++;
         url=url+"&callback=JSON_CALLBACK";
         getData(url,i);
        }
      }, function(response)
         {
            console.log(response);
         });

    }
      

   function plotOnMap()
   {
    console.log("called");
    var photosMarker = {
                "type": "FeatureCollection",
                "features": []
            };
    $scope.photos.forEach(function(ele){


      
      var pointObject = {
        "geometry": {
          "type": "Point",
          "coordinates": [
            ele.location.latitude,
            ele.location.longitude
                         ]
          },
       "type": "Feature",
       "properties": {
          "popupContent" : "<div class='foobar'><img src="+ele.images.standard_resolution.url+" width=350px></div>" ,
          "propic" : ele.images.thumbnail.url
        },
                        "id": "123"
      };
      photosMarker.features.push(pointObject);

                    });
      add_marker(photosMarker);
   }

  function add_marker(result) {
                    
                   // console.log("adding markers");
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                      console.log(i);
                        //console.log(result.features[i].propic-url);
                        var tweetIcon = L.icon({
                        iconUrl: result.features[i].properties.propic ,
                        iconSize:     [30, 30]
                    });
                        var lat = result.features[i].geometry.coordinates[0];
                        var lng = result.features[i].geometry.coordinates[1];
                        console.log(lat+" , "+lng+" plotted");
                        marker[i] = new L.Marker([lat, lng], {
                            id: i,
                            icon: tweetIcon
                        });
                        
                        
                            marker[i].addTo(photoslayer);
                            
                        
                        
                        var popup = L.popup({
                            autoPan: true
                        }).setContent(result.features[i].properties.popupContent);
                        marker[i].bindPopup(popup);
                        plotted++;
                        
                        
                    }
                    
                }



}]);
