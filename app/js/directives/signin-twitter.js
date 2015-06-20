'use strict';
/* global angular, $ */

var directivesModule = require('./_index.js');



directivesModule.directive('signinTwitter', ['$timeout', '$rootScope', 'HelloService', 'AppSettings', function($timeout, $rootScope, HelloService, AppSettings) {
	return {
		scope: {
			hello: '=',
			twitterSession: '=',
		},
		templateUrl: 'signin-twitter.html',
		controller: function($scope) {
			var hello = $scope.hello;

			// Init service, will also evaluate available cookies
			hello.init({
				twitter: AppSettings.twitterConsumerKey
			},
			{
				oauth_proxy: AppSettings.oauthProxyUrl,
				redirect_uri: '/redirect'
			}
			);

			// If service init result in e.g. login
			// Create global session variable
			hello.on('auth.login', function(auth) {
				hello(auth.network).api('/me').then(function(twitterSession) {
					$rootScope.$apply(function() {
						$rootScope.root.twitterSession = twitterSession;	
						$scope.imageURLClear = twitterSession.profile_image_url_https.split('_normal');
						$rootScope.root.twitterSession.profileURL = $scope.imageURLClear[0]+$scope.imageURLClear[1];
						console.log($rootScope.root.twitterSession);
					});
				}, function() {
					console.log("Authentication failed, try again later");
				});

				hello(auth.network).api('/me/friends').then(function(twitterFriendFeed) {
					$rootScope.$apply(function() {
						$rootScope.root.twitterFriends = twitterFriendFeed;
						console.log(twitterFriendFeed);
					});
				}, function(){
					console.log('Unable to load tweets from your followers');
				});
			});

			hello.on('auth.logout', function(auth) {
				$rootScope.$apply(function() {
					$rootScope.root.twitterSession = false;	
				});	
				console.log("Signed out");
			}, function() {
					console.log("Signed out failed, try again later");
			});   
		},
		link: function(scope) {
			var hello = scope.hello;
			var isOnline = hello('twitter').getAuthResponse();

			angular.element(document).ready(function() {
				if (!isOnline) {
					$('#signupModal').modal('show');	
				}
			});

			hello.on('auth.login', function(auth) {
				angular.element('.modal-backdrop').remove();
			});
		}
	};
}]);