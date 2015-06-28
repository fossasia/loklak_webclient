'use strict';

var controllersModule = require('./_index');
var twitterText = require('twitter-text');

controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', function($rootScope, hello) {

    $rootScope.root.tweet= "";
    $rootScope.root.tweetLength = 140;
    console.log($rootScope.root.tweetLength);
    $rootScope.root.foo = function() 
    {    
        var message = $rootScope.root.tweet;
        var tweetLen = twttr.txt.getTweetLength($rootScope.root.tweet);
        var tweet = encodeURIComponent(message);
        console.log(message);
        console.log(tweetLen);
        // hello('twitter').api('me/share', 'POST', {
        //     message : tweet
        // });
    };

    $rootScope.root.tweetLengthCalculate = function() {
        var tweet = $rootScope.root.tweet;
        $rootScope.root.tweetLength = 140 - twttr.txt.getTweetLength(tweet);
        console.log($rootScope.root.tweetLength);
    }

}]);