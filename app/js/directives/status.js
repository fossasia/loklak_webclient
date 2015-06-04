'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function statusDirective($timeout, $location) {

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
            // Click on these tags would result in different action
            var exceptionTags = ['link-to-tweet', 'action-list', 'name', 'external-hashtag', 'external-mention', 'images-wrapper', 'reply', 'retweet', 'favor', 'fa fa-circle', 'copy-link'];
            var className = event.target.className;
            var shouldToggleDetail = true;
            exceptionTags.forEach(function (ele) {
                if (className === ele) {
                    shouldToggleDetail = false;
                    return;
                }
            });

            if (shouldToggleDetail) {
                $scope.showDetail = !$scope.showDetail;    
            }
        };
        $scope.showMoreAction = false;
        $scope.toggleShowMoreAction = function() {
            $scope.showMoreAction = !$scope.showMoreAction;
        };

        $scope.openSingleTweet = function(status_id) {
            var newPath = '/tweet';
            var queryArgs = {
                q: 'id:' + status_id
            };
            $location.path(newPath).search(queryArgs);
        };
    },
    link: function(scope, element, attrs) {
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
        }
        
    }
  };

}

directivesModule.directive('status', statusDirective);