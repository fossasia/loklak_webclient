'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function WallCtrl($scope, $window, $stateParams, $interval, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;

    function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    //Selects foreground colour as black or white based on background
    function colourCalculator(rgb) {
        var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) / 1000);
        if (o > 125) {
            return '#000000';
        } else {
            return '#FFFFFF';
        }
    }

    $scope.$watch('wallOptions.headerColour', function() {
        if($scope.wallOptions)
        $scope.wallOptions.headerForeColour = colourCalculator(hexToRgb($scope.wallOptions.headerColour));
    });

    $scope.$watch('wallOptions.mainHashtagText', function() {
        if($scope.wallOptions.mainHashtagText)
        if($scope.wallOptions.mainHashtagText.length!==0)
        {
            if($scope.wallOptions.mainHashtagText[0] != '#') {
                $scope.wallOptions.mainHashtag = '#' + $scope.wallOptions.mainHashtagText;
            }
            else {
                $scope.wallOptions.mainHashtag = $scope.wallOptions.mainHashtagText;
            }
        }
    });

    $scope.proceed = function() {
        console.log("clicked");
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        $location.path('/wall/display').search($scope.wallOptions);
    };

    $scope.resetDate = function() {
        $scope.wallOptions.sinceDate = null;
        $scope.wallOptions.untilDate = null;
    }

}

controllersModule.controller('WallCtrl', ['$scope', '$window', '$stateParams', '$interval', '$timeout', '$location', '$http', 'AppSettings', 'SearchService', WallCtrl]);

