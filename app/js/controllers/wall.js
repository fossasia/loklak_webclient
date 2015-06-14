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
    var flag = false;

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
        if ($scope.wallOptions)
            $scope.wallOptions.headerForeColour = colourCalculator(hexToRgb($scope.wallOptions.headerColour));
    });

    $scope.$watch('wallOptions.mainHashtagText', function() {
        if ($scope.wallOptions.mainHashtagText)
            if ($scope.wallOptions.mainHashtagText.length !== 0) {
                if ($scope.wallOptions.mainHashtagText[0] != '#') {
                    $scope.wallOptions.mainHashtag = '#' + $scope.wallOptions.mainHashtagText;
                } else {
                    $scope.wallOptions.mainHashtag = $scope.wallOptions.mainHashtagText;
                }
            }
    });

    $scope.proceed = function() {
        console.log("clicked");
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //$scope.wallOptions.allWords = JSON.stringify($scope.wallOptions.allWords);
        for (var i = 0; i < $scope.wallOptions.allWords.length; i++) {
            $scope.wallOptions.allWords[i] = $scope.wallOptions.allWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.anyWords.length; i++) {
            $scope.wallOptions.anyWords[i] = $scope.wallOptions.anyWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.noWords.length; i++) {
            $scope.wallOptions.noWords[i] = $scope.wallOptions.noWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.allHashtags.length; i++) {
            $scope.wallOptions.allHashtags[i] = '#' + $scope.wallOptions.allHashtags[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.from.length; i++) {
            $scope.wallOptions.from[i] = $scope.wallOptions.from[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.to.length; i++) {
            $scope.wallOptions.to[i] = $scope.wallOptions.to[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.mentioning.length; i++) {
            $scope.wallOptions.mentioning[i] = $scope.wallOptions.mentioning[i].text;
        };
        console.log($scope.wallOptions);
        $('#wall-modal').modal('toggle');
        flag = true;
    };

    $("#wall-modal").on('hidden.bs.modal', function() {
        if (flag == true) {
            flag = false;
            $location.path('/wall/display').search($scope.wallOptions);
            $scope.$apply();
        }
    });

    $scope.resetDate = function() {
        $scope.wallOptions.sinceDate = null;
        $scope.wallOptions.untilDate = null;
    }

}

controllersModule.controller('WallCtrl', ['$scope', '$window', '$stateParams', '$interval', '$timeout', '$location', '$http', 'AppSettings', 'SearchService', WallCtrl]);
