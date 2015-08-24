'use strict';
/* global angular, $ */
/* jshint unused:false */

var directivesModule = require('./_index.js');



directivesModule.directive('signinTwitter', ['$interval', '$location', '$timeout', '$rootScope', 'HelloService', 'SearchService', 'AppSettings', 'AuthorizedSearch', '$http', function($interval, $location, $timeout, $rootScope, HelloService, SearchService, AppSettings, AuthorizedSearch, $http) {
	return {
		scope: {
			hello: '=',
			twitterSession: '=',
		},
		templateUrl: 'signin-twitter.html',
		controller: function($scope) {
			var timelineIntervals = [];
			$rootScope.root.timelineNewTweets = [];
			$rootScope.root.haveNewerTweets = false;
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
					// Gather id_str from result from Twitter API
					// for later the get similar results from loklak
					var activityFeedIdStrArray = [];
					twitterFriendFeed.data.forEach(function(feed) {
						if (feed.status) {
							activityFeedIdStrArray.push(feed.status.id_str);
						}
					});
					// Sort by created time to show on timeline
					twitterFriendFeed.data.sort(function(a,b) {
						if (b.status && a.status) {
							return new Date(b.status.created_at) - new Date(a.status.created_at);	
						}
					});
					// Injection out of angular operations
					$rootScope.$apply(function() {
						$rootScope.root.twitterFriends = twitterFriendFeed;
						$rootScope.root.activityFeedIdStrArray = activityFeedIdStrArray;
						$rootScope.root.homeFeedLimit = 15;
						$rootScope.root.loadMoreHomeFeed = function(operand) {
							$rootScope.root.homeFeedLimit += operand;
						};
					});
				}, function(){
					console.log('Unable to load tweets from your followers');
				});

				var updateTimeline = function() {
					hello(auth.network).api('/me/friends').then(function(twitterFriendFeed) {
						// Sort by created time to show on timeline
						twitterFriendFeed.data.sort(function(a,b) {
							if (b.status && a.status) {
								return new Date(b.status.created_at) - new Date(a.status.created_at);	
							}
						});
						var haveNewerTweet = true;
						var i = 0; 
						var newerTweets = [];
						var currentNewest = new Date($rootScope.root.twitterFriends.data[0].status.created_at);
						while (haveNewerTweet && i < twitterFriendFeed.data.length) {
							if (!twitterFriendFeed.data[i].status) {
								i++
							} else {
								var beingEvalTimestamp = new Date(twitterFriendFeed.data[i].status.created_at);
								if (beingEvalTimestamp <= currentNewest) {
									haveNewerTweet = false;
								} else {
									newerTweets.push(twitterFriendFeed.data[i]);
									i++;	
								}
							}
						}
						if (newerTweets.length > 0) {
							$rootScope.$apply(function() {
								$rootScope.root.timelineNewTweets = newerTweets;
								$rootScope.root.haveNewerTweets = true;
							});
						}
					}, function(){
						console.log('Unable to load tweets from your followers');
					});
				}

				// Start an interval to update timeline
				angular.forEach(timelineIntervals, function(interval) {
				    $interval.cancel(interval);
				})
				timelineIntervals.push($interval(updateTimeline, 30000)); 
			});

			hello.on('auth.logout', function(auth) {
				$rootScope.$apply(function() {
					$rootScope.root.twitterSession = false;	
				});	
				angular.element("#map").remove();
				if ($location.path() === "/search") {
					angular.element(".topnav .global-search-container").removeClass("ng-hide");
				} else {
					angular.element(".topnav .global-search-container").addClass("ng-hide");
				}
			}, function() {
					console.log("Signed out failed, try again later");
			});   

			$rootScope.root.timelineShowNewerTweets = function() {
				$rootScope.root.twitterFriends.data = $rootScope.root.timelineNewTweets.concat($rootScope.root.twitterFriends.data);
				$rootScope.root.timelineNewTweets = [];
				$rootScope.root.haveNewerTweets = false;
			}

			/* Listener on nav */
			$rootScope.root.ToggleMobileNav = function() {
				angular.element("#pull .lines-button").toggleClass("close");
				$(".hidden-items").toggle();
				$(".topnav-user-actions .signin-twitter").toggle(); 
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
					if ($rootScope.root.haveSearchSuggestion !== false) {
						$rootScope.suggestionsHttpCanceler.resolve();
						$rootScope.root.haveSearchSuggestion = false;
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
			    SearchService.getTrendsAggregation(params).then(function(data) {
			               hashtagData = hashtagData.concat(data.aggregations.hashtags);
			               $rootScope.root.trends = hashtagData[0];
			        }, function() {

			        });
			}, 1000);

		},
		link: function(scope) {
			var hello = scope.hello;
			var isOnline = hello('twitter').getAuthResponse();
			var idleTime = 0;

			$rootScope.root.aSearchWasDone = false;
			var timerIncrement = function() {
			    idleTime = idleTime + 1;
			    if (idleTime > 10 && (!$rootScope.root.twitterSession && !$rootScope.root.aSearchWasDone)) { 
		    		$('#signupModal').modal('show');		
		    		$rootScope.root.aSearchWasDone = true;
			    }
			}

			angular.element(document).ready(function() {
				var idleInterval = setInterval(timerIncrement, 1000);
			    $(this).mousemove(function (e) { idleTime = 0; });
			    $(this).keypress(function (e) { idleTime = 0; });

				if (!isOnline) {
					if ($location.path() !== "/search" && $location.path() !== "/advancedsearch" && $location.path() !== "/topology") {
						angular.element(".topnav .global-search-container").addClass("ng-hide");
					}
				}

				/*
	             * Dynamic UI on state changes
				 */
				$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
					// If moving away from search: cancel old search, suggestion, empty search field
					if (toState.name !== "Search") {
						$rootScope.root.globalSearchTerm = "";
						if ($rootScope.httpCanceler) { $rootScope.httpCanceler.resolve();}
						if ($rootScope.suggestionsHttpCanceler) { $rootScope.suggestionsHttpCanceler.resolve();}
						$rootScope.root.haveSearchSuggestion = false;
					}

					// Maintain only one search box in all views when logged/not logged in.
					var isOnline = hello('twitter').getAuthResponse(); 
					if (!isOnline) {
						if (toState.name === "Search" || toState.name === "Topology") {
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