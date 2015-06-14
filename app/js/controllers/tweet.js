'use strict';


var controllersModule = require('./_index');

function tweetCtrl($http, AppSettings, SearchService, hello) { // jshint ignore:line
    // SAid you use ng-click="tweetCtrl.postTweet()" on somewhere

    var vm = this;

    vm.postTweet = function() {
        var paramsObject = {};
        // Do something to gather the fields in your form
        hello('twitter').api('blabla', 'bla', paramsObject, function(result) {
            // Process your result by updating your models etc etc
        });
    };
}

controllersModule.controller('tweetCtrl', ['$http', 'AppSettings', 'SearchService', 'HelloService', tweetCtrl]);