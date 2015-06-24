'use strict';

var controllersModule = require('./_index');
var hello=require('../components/hello.all');


controllersModule.controller('HomeCtrl', ['$rootScope', function($rootScope) {

    $rootScope.root.tweet="";
    $rootScope.root.foo = function() 
    {    
    var message = $rootScope.root.tweet;
    var tweet = encodeURIComponent(message);
    console.log(message);
    hello('twitter').api('me/share', 'POST', {
        message : tweet
    });
    
    };

}]);