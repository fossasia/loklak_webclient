'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function searchModalDirective() {

  return {
    scope: {
    	modalData: '=',
    	switchToSwipe: '=',
    	tweetModalShow: '=',
    },
    templateUrl: 'search-modal.html',
    controller: function($scope, $element) {
    	$scope.closeModal = function(event) {
    		if (event.target.className === "modal-wrapper modal-show") {
    			$scope.tweetModalShow = false;
    		}
    	}
    },
    link: function(scope, element, attrs) {
    	angular.element(document).bind("keydown", function(event) {
    		if (event.keyCode === 27) {
    			scope.$apply(function() {
    				scope.tweetModalShow = false;	
    			});
    		}
    	});
    },
  };

}

directivesModule.directive('searchModal', searchModalDirective);