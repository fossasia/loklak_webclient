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
			/* Check if a session is available before hello.js even initialize
	         * in order to determine if the application is going to login automatically or not
			 */
			var twitterStorageObject = JSON.parse(localStorage.getItem("hello"));
			if (!twitterStorageObject || !twitterStorageObject.twitter) {
				$rootScope.root.twitterSession = false;
			} else {
				$rootScope.root.twitterSession = true;
			}
			
			$rootScope.root.isHelloDoneCheckingCookies = true;				

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
					$rootScope.root.twitterSession = true;

					$rootScope.$apply(function() {
						$rootScope.root.twitterSession = twitterSession;	
						$scope.imageURLClear = twitterSession.profile_image_url_https.split('_normal');
						$rootScope.root.twitterSession.profileURL = $scope.imageURLClear[0]+$scope.imageURLClear[1];
					});

					SearchService.retrieveTopology($rootScope.root.twitterSession.screen_name, 10000).then(function(result) {
						result.topology.followers.forEach(function(status) {
							status.isAFollower = true;
							status.isAFollowing = status.following;
						})
						result.topology.following.forEach(function(status) {
							status.isAFollower = false;
							status.isAFollowing = true;
						})
						$rootScope.userTopology  = result.topology;
						console.log($rootScope.userTopology);
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
					window.foo = twitterFriendFeed;
					twitterFriendFeed.data.sort(function(a,b) {
						if (b.status && a.status) {
							return new Date(b.status.created_at) - new Date(a.status.created_at);	
						}
					});
					$rootScope.$apply(function() {
						$rootScope.root.twitterFriends = twitterFriendFeed;
						$rootScope.root.homeFeedLimit = 15;
						$rootScope.root.loadMoreHomeFeed = function(operand) {
							$rootScope.root.homeFeedLimit += operand;
						};
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
				angular.element("#map").remove();
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


			/* Global listener, mainly used to disable features when clicked out of area*/
			window.onclick = function(e) {
				var targetClasses = e.target.className;
				var targetId = e.target.id;

				// If user-info (top-right nav) is shown, clicked out of its area will disable it
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

				// If suggestions are shown, clicked out of its area will disable it
				if(!targetClasses || targetClasses.indexOf("suggestion-item") === -1) {
					$rootScope.root.haveSearchSuggestion = false;
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

			/** Get hashtag trends **/
			$timeout(function() {
			    function getMonth(monthStr){
			        return new Date(monthStr+'-1-01').getMonth()+1
			    }
			    var hashtagData = [];
			    var queryString = '';
			    var currentDate = new Date();
			    var untilDate = currentDate.toString();
			    var untilElements = untilDate.split(' ');
			    var untilMonthValue = ('0'+getMonth(untilElements[1])).slice(-2);
			    var untilDateString = 'until:'+untilElements[3]+'-'+untilMonthValue+'-'+('0'+untilElements[2]).slice(-2);
			    var sinceDate = new Date();
			    sinceDate.setDate(sinceDate.getDate()-20);
			    var sinceDay = ('0' + sinceDate.getDate()).slice(-2);
			    var sinceMonth = ('0' + (sinceDate.getMonth()+1)).slice(-2);
			    var sinceYear = sinceDate.getFullYear();
			    var sinceDateString = 'since:'+sinceYear+'-'+sinceMonth+'-'+sinceDay+' ';
			    queryString = sinceDateString+untilDateString;
			    var params = {
			        q: queryString,
			        source: 'cache',
			        count: 0,
			        fields: 'hashtags',
			        limit: 6
			    };
			    SearchService.initData(params).then(function(data) {
			               hashtagData = hashtagData.concat(data.aggregations.hashtags);
			               $rootScope.root.trends = hashtagData[0];
			        }, function() {

			        });
			}, 3000);
		},
		link: function(scope) {
			var hello = scope.hello;
			var isOnline = hello('twitter').getAuthResponse();
			var idleTime = 0;

			$rootScope.root.aSearchWasDone = false;
			var timerIncrement = function() {
			    idleTime = idleTime + 1;
			    if (idleTime > 7 && (!$rootScope.root.twitterSession && !$rootScope.root.aSearchWasDone)) { 
		    		$('#signupModal').modal('show');		
			    }
			}

			angular.element(document).ready(function() {
				var idleInterval = setInterval(timerIncrement, 1000);
			    $(this).mousemove(function (e) { idleTime = 0; });
			    $(this).keypress(function (e) { idleTime = 0; });

				if (!isOnline) {
					if ($location.path() !== "/search" && $location.path() !== "/advancedsearch") {
						angular.element(".topnav .global-search-container").addClass("ng-hide");
					}
				}


				$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
					var isOnline = hello('twitter').getAuthResponse(); 
					if (!isOnline) {
						if (toState.name === "Search") {
							angular.element(".topnav .global-search-container").removeClass("ng-hide");
						} else {
							angular.element(".topnav .global-search-container").addClass("ng-hide");
						}		
					} else {
						angular.element(".topnav .global-search-container").removeClass("ng-hide");
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