'use strict';

var directivesModule = require('./_index.js');




directivesModule.directive('signinTwitter', ['$rootScope', 'HelloService', function($rootScope, HelloService) {
	return {
		scope: {
			hello: '=',
		},
		templateUrl: 'signin-twitter.html',
		controller: function($scope) {
			var hello = HelloService;

			/**
			*  Init hellojs service and session 
			*
			*/
			$rootScope.root.hello = hello;

			// Init service, will also evaluate available cookies
			hello.init({
				twitter: '0CbZ9fnYkxdBB7mRsbGtggkiW'
			});

			// If service init result in e.g. login
			// Create global session variable
			hello.on('auth.login', function(auth) {
				hello(auth.network).api('/me').then(function(twitterSession) {
					$rootScope.$apply(function() {
						$rootScope.root.twitterSession = twitterSession;	
					});
				}, function(err) {
					console.log("Authentication failed, try again later");
				});   
			});

			hello.on('auth.logout', function(auth) {
				alert('Signed out');
				$rootScope.$apply(function() {
					$rootScope.root.twitterSession = false;	
				});	
			}, function(err) {
					console.log("Signed out failed, try again later");
			});   
		}
	};
}]);