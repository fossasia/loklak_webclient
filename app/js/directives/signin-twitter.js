'use strict';

var directivesModule = require('./_index.js');



directivesModule.directive('signinTwitter', ['$rootScope', 'HelloService', 'AppSettings', function($rootScope, HelloService, AppSettings) {
	return {
		scope: {
			hello: '=',
			twitterSession: '=',
		},
		templateUrl: 'signin-twitter.html',
		controller: function() {
			var hello = HelloService;

			/**
			*  Init hellojs service and session 
			*
			*/
			$rootScope.root.hello = hello;

			// Init service, will also evaluate available cookies
			hello.init({
				twitter: AppSettings.twitterConsumerKey
			},
			{
				oauth_proxy: AppSettings.oauthProxyUrl
			},
			{
				redirect_uri: AppSettings.oauthProxyRedirectUrl
			}
			);
			console.log(hello);

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