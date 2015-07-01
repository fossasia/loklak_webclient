'use strict';
/* global angular */

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */

directivesModule.directive('status', ['$location', '$timeout', '$rootScope', 'HelloService', 'AppSettings',   function($location, $timeout, $rootScope, HelloService, AppSettings) {
    return {
        scope: {
            data: '=',
            highlight: '=',
            openSwipe: '=',
            hello: '=',
        },
        templateUrl: 'status.html',
        controller: function($scope) {
            $scope.showDetail = false;
            $scope.showMoreAction = false;
            $scope.debuggable = true;
            var hello = $scope.hello;

            /**
             * Click on a certain area of a status will toggle/expand it
             * Decision is made on the className of the clicked area
             */
            $scope.toggleDetail = function(event) {
                var exceptionTags = ['link-to-tweet', 'action-list', 'name', 'external-hashtag', 'external-mention', 'images-wrapper', 'reply', 'retweet', 'favor', 'action-more', 'fa fa-circle', 'copy-link'];
                var className = event.target.className;
                var shouldToggleDetail = true;

                // Check among exception tags's className
                exceptionTags.forEach(function (ele) {
                    if (className === ele) {
                        shouldToggleDetail = false;
                        return;
                    }
                });

                // Toggle/expand tweet
                if (shouldToggleDetail) {
                    $scope.showDetail = !$scope.showDetail;    
                }
            };
            
            // Show more action when click on the three dots
            $scope.toggleShowMoreAction = function() {
                $scope.showMoreAction = !$scope.showMoreAction;
            };

            // Actions in the 'more actions' groups
            $scope.openSingleTweet = function(status_id) {
                var newPath = '/tweet';
                var queryArgs = {
                    q: 'id:' + status_id
                };
                $location.path(newPath).search(queryArgs);
            };

            $scope.retweet = function(id) {
                console.log(id);
                hello('twitter').api('me/share', 'POST', {
                    id : id
                });
            }

             $scope.favorite = function(id) {
                console.log(id);
                hello('twitter').api('me/like', 'POST', {
                    id : id
                });
            }
        },
        link: function(scope, element, attrs) {

            /**
             * Apply to only images-wrapper with 3 imgs
             * The main idea is to fill the image in the given area
             * Since the width of imgs are arbitrary, sizes are then
             * evaluated, to assign a certain css class 
             * to expand width/height according, while maintaining the ratio
             * Run when last img is loaded
             */
            if (scope.$parent.$last) {
                var imgEle = angular.element('img');

                imgEle.bind('load', function() {
                    var imgs = angular.element('.triple-masonry-item.first-item').find('img');

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

}]);
