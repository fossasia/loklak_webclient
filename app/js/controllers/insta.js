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
      var url="https://api.instagram.com/v1/users/self/feed?callback=JSON_CALLBACK&access_token=";
      var map2 =L.map('map2',{layers:[grayscale,photoslayer]}).setView([20,0], 2);
      var access_token;
      var query = window.location.href;
      var vars = query.split("#");
      var pairs=vars[1].split("=");
      access_token=pairs[1];
      url=url+access_token;
    console.log(url);
    $http.jsonp(url).then(function(response) {
       console.log(response);  }, function(response) {

      console.log(response);
  });
  $scope.curr_page=0;
  $scope.lastpage;
 

   
      


}]);
