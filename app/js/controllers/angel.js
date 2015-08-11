'use strict';
/* global angular, L */
/* jshint unused:false */

var controllersModule = require('./_index');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var result;
var startupslocation=[];
var marker=[];
var plotted=0;
/**
 * @ngInject
 */

 controllersModule.controller('AngelCtrl', ['$rootScope','$location','$http','$scope','AppSettings','MapPopUpTemplateService', function($rootScope,$location,$http,$scope,AppSettings,MapPopUpTemplateService) {
  


  var totalpage=0;
  var currentpage=0;
  $scope.startups=[];
  var startupslayer = new L.LayerGroup();
  var overlays = {
            "Startups" : startupslayer 
        };
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

      var map = L.map('map',{layers:[grayscale,startupslayer]}).setView([20,0], 2);
      var code = function () {
      var query_string = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
           query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
      } 
    return query_string;
    }();

    $http.jsonp('https://angel.co/api/oauth/token?callback=JSON_CALLBACK', { params:
    {
      code : code,
      grant_type:'authorization_code'
    }}).then(function(response) {
      //$location.path('/startups');
  }, function(response) {

      //$location.path('/startups');
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
  $scope.curr_page=0;
  $scope.lastpage;
 

    var url="https://api.angel.co/1/startups?filter=raising&access_token=8cd27d851f1e4b69e27a29cc9606822c118586d4c8b168b5&callback=JSON_CALLBACK";
    console.log(url);
    $http.jsonp(url).
    then(function(response) {
      $scope.curr_page=response.data.page;
      $scope.lastpage=response.data.last_page;
      getStartups($scope.lastpage);
      //console.log($rootScope.root.startups);
    
  }, function(response) {
    
    
    console.log(response);
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });

  function getStartups(lastpage)
  {
    var i=1;
    for(i=1;i<=15;i++)
    {
      $scope.startups.length=0; 
      startupslocation.length=0;
      
      var url="https://api.angel.co/1/startups?filter=raising&access_token=8cd27d851f1e4b69e27a29cc9606822c118586d4c8b168b5&callback=JSON_CALLBACK&page="+i;
      $http.jsonp(url).
    then(function(response) {
      
      response.data.startups.forEach(function(ele){
        
        if(ele.locations[0])
        {
          
        $scope.startups.push(
        {
          "startup_name" : ele.name,
          "startup_url"  : ele.company_url,
          "logo_url"     : ele.logo_url,
          "product_desc" :ele.high_concept,
          "location"     : ele.locations[0].display_name,
          "quality"      : ele.quality
          
          });
        if(ele.locations[0].display_name)
        {
         // console.log(ele.locations[0].display_name)
        }
        else
        {
          console.log("This startup has no locations");
        }
        
        startupslocation.push(ele.locations[0].display_name);
      }
      
      })
      Geocode();

        }, function(response) {
    
   
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });


    }
   
    
    function Geocode()
            { console.log("called");
                
                var locarray = {

                    "places" : startupslocation
                }
               
                
            $http.jsonp('http://localhost:9000/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
              
              var startupsMarker = {
                "type": "FeatureCollection",
                "features": []
            };
                //console.log( followers.propic[i]);
                $scope.startups_status=startupslocation.length;
                for(var i=0;i<startupslocation.length;i++)
                {
                    
                   
                    var locationkey=startupslocation[i];
                    
                    if(data.locations[locationkey].mark)
                    {
                      
                    var textpopup=MapPopUpTemplateService.startupInfoPopUp($scope.startups[i]);
                    //console.log("I am viewing "+followers[i].name);
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
                            "popupContent" : "<div class='foobar'>"+textpopup+"</div>" ,
                            "propic" : $scope.startups[i].logo_url

                        },
                        "id": "123"

                    };
                    startupsMarker.features.push(pointObject);

                    }
                }
                   add_marker(startupsMarker);
                    
                
                }).error(function(data, status, headers, config) {
                    

                    console.log("There is error.Loklak Server did not respond with geodata.We will try again."+data+"fff"+status);
                    $scope.followers_status="Load Failed.Twitter did not respond."
                    
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
               
        }

  }


  function add_marker(result) {
                    
                    
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
                        
                        
                            marker[i].addTo(startupslayer);
                        
                        
                        var popup = L.popup({
                            autoPan: true
                        }).setContent(result.features[i].properties.popupContent);
                        marker[i].bindPopup(popup);
                        plotted++;
                        
                        
                    }
                    
                }
      


}]);

