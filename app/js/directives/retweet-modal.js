'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("retweetModal", ["$rootScope", function($rootScope) {

	return {
		scope: true,
		templateUrl: "retweet-modal.html",
		controller: function($scope, $element, $attrs) {
			
			$scope.status = {};
			$scope.$watch(function() {
				return $rootScope.root.currentTweet;
			}, function(value) {
				$scope.status = value;
			});
			
			$scope.confirmRt = function() {
				var id = $rootScope.root.currentTweet.id_str;
				$rootScope.root.hello('twitter').api('me/share', 'POST', {
			        id : id
			    }).then(function(json) {
                      console.log(json);
                  }, function(e) {
                      console.log(e);
                  });;

			    angular.element(".retweet-modal").addClass("hide");
			}
		}
	};
}]);