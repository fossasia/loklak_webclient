'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function statusDirective($timeout) {

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
    },
    link: function(scope, element, attrs) {
        console.log(scope.$parent.$last);
        if (scope.$parent.$last) {
            var imgEle = angular.element('img');
            imgEle.bind('load', function() {
                var imgs = angular.element('.triple-masonry-item.first-item').find('img')   ;
                angular.forEach(imgs, function(value, key) {
                    var height = value.clientHeight;
                    var width = value.clientWidth;
                    var classToAdd = (height >= width) ? 'vertical' : 'landscape';
                    angular.element(value).addClass(classToAdd);
                });
            });
        };
        
    }
  };

}

directivesModule.directive('status', statusDirective);