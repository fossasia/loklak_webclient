'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("retweetModal", ["$rootScope", function($rootScope) {

	return {
		scope: {},
		templateUrl: "retweet-modal.html",
		controller: function($scope, $element, $attrs) {
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