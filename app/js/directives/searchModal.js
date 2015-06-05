'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function searchModalDirective($location) {

  return {
    scope: {
    	modalData: '=',
    	switchToSwipe: '=',
    	tweetModalShow: '=',
    },
    templateUrl: 'search-modal.html',
    controller: function($scope, $element) {
        $scope.showMoreAction = false;

        // Modal can be closed by clicking around the modal
    	$scope.closeModal = function(event) {
    		if (event.target.className === "modal-wrapper modal-show") {
    			$scope.tweetModalShow = false;
                $scope.showMoreAction = false;
    		}
    	};

        // Show more action when click on the three dots
        $scope.toggleShowMoreAction = function() {
            $scope.showMoreAction = !$scope.showMoreAction;
        };

        // Actions in the 'more actions' groups
        $scope.openSingleTweet = function(status_id) {
            var newPath = '/tweet';
            var queryargs = {
                q: 'id:' + status_id
            };
            $location.path(newPath).search(queryargs);
        };
    },
    link: function(scope, element, attrs) {
        // Modal can be closed by 'ESC' keydown
    	angular.element(document).bind("keydown", function(event) {
    		if (event.keyCode === 27) {
    			scope.$apply(function() {
    				scope.tweetModalShow = false;	
                    scope.showMoreAction = false;
    			});
    		}
    	});
    },
  };

}

directivesModule.directive('searchModal', searchModalDirective);