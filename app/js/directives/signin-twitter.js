'use strict';
/* global angular, $ */
/* jshint unused:false */

var directivesModule = require('./_index.js');



directivesModule.directive('signinTwitter', ['$location', '$timeout', '$rootScope', 'HelloService', 'SearchService', 'AppSettings', 'AuthorizedSearch', '$http', function($location, $timeout, $rootScope, HelloService, SearchService, AppSettings, AuthorizedSearch, $http) {
	return {
		scope: {
			hello: '=',
			twitterSession: '=',
		},
		templateUrl: 'signin-twitter.html',
		controller: function($scope) {

			/* Hello related init*/
			var hello = $scope.hello;
			window.hello = hello;

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
					});

					SearchService.retrieveTopology($rootScope.root.twitterSession.screen_name, 500).then(function(result) {
						result.topology.followers.forEach(function(status) {
							status.isAFollower = true;
						})
						result.topology.following.forEach(function(status) {
							status.isAFollower = false;
						})
						$rootScope.userTopology  = result.topology;
						$rootScope.userTopology.noOfFollowings = result.user.friends_count
						$rootScope.userTopology.noOfFollowers = result.user.followers_count
					}, function() {});

					var oauth_info = hello("twitter").getAuthResponse();
					if (oauth_info) {
					    var screen_name = oauth_info.screen_name;
					    var token = oauth_info.access_token.split(":")[0];
					    var secret = oauth_info.access_token.split(":")[1].split("@")[0];
					    AuthorizedSearch.getLoggedInAccountInfo(screen_name, token, secret).then(function(data) {
					        	$rootScope.root.authorizedUserInfo = data;
					    }, function() {}); 
					}

					angular.element(".topnav .global-search-container").removeClass("ng-hide");


				}, function() {
					console.log("Authentication failed, try again later");
				});

				hello(auth.network).api('/me/friends').then(function(twitterFriendFeed) {
					twitterFriendFeed.data.sort(function(a,b) {
						if (b.status && a.status) {
							return new Date(b.status.created_at) - new Date(a.status.created_at);	
						}
					});
					$rootScope.$apply(function() {
						$rootScope.root.twitterFriends = twitterFriendFeed;
					});
				}, function(){
					console.log('Unable to load tweets from your followers');
				});

				//
			});

			hello.on('auth.logout', function(auth) {
				$rootScope.$apply(function() {
					$rootScope.root.twitterSession = false;	
				});	
				if ($location.path() !== "/") {
					angular.element(".topnav .global-search-container").removeClass("ng-hide");
				} else {
					angular.element(".topnav .global-search-container").addClass("ng-hide");
				}
			}, function() {
					console.log("Signed out failed, try again later");
			});   

			/* Listener on nav */
			$rootScope.root.ToggleMobileNav = function() {
				angular.element("#pull .lines-button").toggleClass("close");
				$(".hidden-items").toggle(); 
			};

			/* Listen on user avatar */
			$scope.toggleOptions = function() {
				angular.element(".hidden-user-info").toggleClass("hide");
			};
			window.onclick = function(e) {
				var targetClasses = e.target.className;
				var targetId = e.target.id;
				if (!targetClasses || typeof(targetClasses) === "object") {
					if (!angular.element(".hidden-user-info").hasClass("hide")) {
						angular.element(".hidden-user-info").toggleClass("hide");
					}
				} else {
					if (targetClasses.indexOf("hidden-user-info") === -1 && targetId.indexOf("home-view-user-avatar") === -1) {
						if (!angular.element(".hidden-user-info").hasClass("hide")) {
							angular.element(".hidden-user-info").toggleClass("hide");
						}		
					}	
				}
				
			};
		},
		link: function(scope) {
			var hello = scope.hello;
			var isOnline = hello('twitter').getAuthResponse();

			angular.element(document).ready(function() {
				if (!isOnline) {
					$('#signupModal').modal('show');	
					angular.element(".topnav .global-search-container").addClass("ng-hide");
				}

				if ($location.path() !== "/") {
					angular.element(".topnav .global-search-container").removeClass("ng-hide");
				}

				$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
				    if (toState.name !== "Home") {
				    	angular.element(".topnav .global-search-container").removeClass("ng-hide");
				    } else {
				    	angular.element(".topnav .global-search-container").addClass("ng-hide");
				    }
				});
			});

			hello.on('auth.login', function(auth) {
				angular.element('.modal-backdrop').remove();
				angular.element("body").removeClass("modal-open");
			});
		}
	};
}]);