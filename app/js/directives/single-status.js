'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */

directivesModule.directive('singleStatus', ['$location', '$rootScope', function($location, $rootScope) {
    return {
        scope: {
            data: '=',
            openSwipe: '=',
            showStatus: '=',
        },
        templateUrl: 'single-status.html',
        controller: function($scope, $element, $attrs) {
            $scope.debuggable = true;

            // retweet action
            $scope.retweet = function() {
                $rootScope.root.currentTweet = $scope.data;        
                angular.element(".retweet-modal").removeClass("hide");
            };

            // favorite action
            $scope.favorite = function(id) {
                console.log('Single Status');
                var actionString = '#fav-'+id;
                $rootScope.root.hello('twitter').api('me/like', 'POST', {
                    id : id
                }).then( function(json) {
                    console.log(json);
                    $(actionString).css("background-position" , "100% 100%");
                }, function (e) {
                    console.log(e);
                });
            };

        },
        link: function(scope, element, attrs) {

            /**
             * Apply to only images-wrapper with 3 imgs
             * The main idea is to fill the image in the given area
             * Since the width of imgs are arbitrary, sizes are then
             * evaluated, to assign a certain css class 
             * to expand width/height according, while maintaining the ratio
             */
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
    };
}]);
