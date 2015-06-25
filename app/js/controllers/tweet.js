'use strict';

var controllersModule = require('./_index');


controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', function($rootScope, hello) {

    $rootScope.root.tweet= "";
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