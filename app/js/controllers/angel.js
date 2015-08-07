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

 controllersModule.controller('AngelCtrl', ['$rootScope','$http','$scope','AppSettings', function($rootScope,$http,$scope,AppSettings) {
    
var code = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
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
$http.post('https://angel.co/api/oauth/token', { params:
    {client_id:'f148a48d308ee0ee11eb938a2f2f88bff24abb235412f596',
    client_secret:'45b13fc4264976a051f40e4bbc62b91e0d0b50999ff9b089',
    code : code,
    grant_type:'authorization_code'
    }}).
  then(function(response) {
    //console.log("Sent a request to guardian angel");
    document.getElementById("data").innerHTML=response.data;
    console.log(response);
  }, function(response) {
    console.log("Sent a reqwwuest to guardian angel");
    document.getElementById("data").innerHTML=response.data;
    console.log(response);
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
console.log(code);
      


}]);

