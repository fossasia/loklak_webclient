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
        var tweetLen = twttr.txt.getTweetLength(message);
        var tweet = encodeURIComponent(message);
        console.log(message);
        console.log(tweetLen);
        if(tweetLen <= 140 && tweetLen > 0) {
            hello('twitter').api('me/share', 'POST', {
                message : tweet
            });
        }
        else {
            console.log("The tweet doesn't validate as a valid tweet. Reduce the number of characters and try again");
        }
    };

    $rootScope.root.tweetLengthCalculate = function() {
        var tweet = $rootScope.root.tweet;
        $rootScope.root.tweetLength = 140 - twttr.txt.getTweetLength(tweet);
        console.log($rootScope.root.tweetLength);
    }

    $rootScope.root.retweet = function(id) {
        console.log(id);
    }

}]);