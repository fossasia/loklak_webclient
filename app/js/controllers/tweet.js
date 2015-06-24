'use strict';

var controllersModule = require('./_index');
var hello=require('../components/hello.all');


controllersModule.controller('HomeCtrl', ['$rootScope', function($rootScope) {

    $rootScope.root.tweet="";
    $rootScope.root.file={};
    $rootScope.root.foo = function() 
    {    
    var message = $rootScope.root.tweet;
    var tweet = encodeURIComponent(message);
    var files  = $rootScope.root.file.files;
    console.log(files);
    getLocation();
    console.log(message);
    hello('twitter').api('me/share', 'POST', {
        message : tweet ,
        file : files
    }).then(log,log);
    function log(){
	console.log(arguments);
}

    };
    function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	document.getElementById('latitude').value = latitude;
	document.getElementById('longitude').value = longitude;
    console.log("Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude);
}

}]);