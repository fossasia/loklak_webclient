'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function statusDirective() {

  return {
    scope: {
    	data: '=',
    	highlight: '=',
    	openSwipe: '=',
    	showModal: '=',
    },
    templateUrl: 'status.html',
    controller: function($scope, $element) {
        // Toggle show-hide detail when clicked
        // execept when clicked on "Details"
        $scope.showDetail = false;
        $scope.toggleDetail = function(event) {
            if (!(event.target.className === "link-to-tweet")) 
                $scope.showDetail = !$scope.showDetail;
        };
    }
  };

}

directivesModule.directive('status', statusDirective);