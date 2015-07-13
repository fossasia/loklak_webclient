'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("retweetModal", ["$rootScope", function($rootScope) {

	return {
		scope: true,
		templateUrl: "retweet-modal.html",
		controller: function($scope, $element, $attrs) {
			$scope.comment = "";
			$scope.remainingChars = 140;
			$scope.status = {};

			// Max-length = comment.length + tweet.link
			$scope.$watch(function() {
				return $rootScope.root.currentTweet;
			}, function(value) {
				if (value) {
					$scope.status = value;
					$scope.remainingChars = 140 - value.link.length;	
				}
			});

			// Watching comment.length
			$scope.$watch(function() {
				return $scope.comment;
			}, function() {
				if ($scope.status.link) {
					$scope.remainingChars = 140 - $scope.status.link.length - $scope.comment.length;	
				} else {
					$scope.remainingChars = 140 - $scope.comment.length;
				}
				
				if ($scope.remainingChars <= 0) {
					angular.element(".remaining-chars").addClass("red");
					angular.element(".retweet-button").addClass("disabled");
				} else {
					if (angular.element(".remaining-chars").hasClass("red")) {
						angular.element(".remaining-chars").removeClass("red");
					}
					if (angular.element(".retweet-button").hasClass("disabled")) {
						angular.element(".retweet-button").removeClass("disabled");
					}
				}
			})
			
			// Click on textarea will expand it
			$scope.showMoreCols = function() {
				angular.element(".retweet-modal .retweet-comment textarea").addClass("active");				
			}

			$scope.closeRtModal = function() {
				angular.element(".retweet-modal").addClass("hide");		
				$scope.comment = "";		
			}

			// Retweet action
			$scope.confirmRt = function() {
				if (!angular.element(".retweet-button").hasClass("disabled")) {
					// RT with comment
					if ($scope.comment) {
						var tweet = $scope.comment + " " + $scope.status.link;
						$rootScope.root.hello('twitter').api('me/share', 'POST', {
				        	message : tweet
					    }).then(function(json) {

						}, function(e) {
							console.log(e);
						});;
						angular.element(".retweet-modal").addClass("hide");
						$scope.comment = "";
					} else { // Just RT
						var id = $rootScope.root.currentTweet.id_str;
						$rootScope.root.hello('twitter').api('me/share', 'POST', {
					        id : id
					    }).then(function(json) {
					    	
		                  }, function(e) {
		                      console.log(e);
		                  });;
					    angular.element(".retweet-modal").addClass("hide");
					}
				}
			}
		}
	};
}]);