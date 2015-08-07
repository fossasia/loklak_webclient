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

					SearchService.retrieveTopology($rootScope.root.twitterSession.screen_name, 10000).then(function(result) {
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

			/** Model for home view **/
			$rootScope.root.home = {};
			$rootScope.root.home.evalToCloseOverlay = function($event) {
				if ($event.target.className === "operator-overlay-container") {
					$rootScope.root.home.operatorOverlayShow = false;
				}
			}

			$rootScope.root.home.operators = {
				'loklak messages': 'containing both "loklak" and "messages". This is the default operators',
				'loklak /image': 'containing "loklak" and must have at least an image. Other possible filter is /video, /accounts, /map',
				'loklak since:2015-08-02 until:2015-08-14' : 'containing "loklak" and shared between the according point of time',
				'beer -root': 'containing "beer" but not "root"',
				'beer -/profanity': 'containing "beer" but not tweet with profane content',
				'"happy hour"': 'containing the exact phrase "happy hour".',
				'love OR hate': 'containing either "love" or "hate" (or both).',
				'#haiku': 'containing the hastag "haiku"',
				'from:alexiskold' : 'shared by user with screen name "alexiskold"',
				'near:London': 'shared near London'
			}


		},
		link: function(scope) {
			var hello = scope.hello;
			var isOnline = hello('twitter').getAuthResponse();
			var idleTime = 0;
			var timerIncrement = function() {
			    idleTime = idleTime + 1;
			    if (idleTime > 7 && !$rootScope.root.twitterSession) { 
		    		$('#signupModal').modal('show');		
			    }
			}

			angular.element(document).ready(function() {
				var idleInterval = setInterval(timerIncrement, 1000);
			    $(this).mousemove(function (e) { idleTime = 0; });
			    $(this).keypress(function (e) { idleTime = 0; });

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