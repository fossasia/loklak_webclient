'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallCtrl($scope, $window, $stateParams, $interval, $timeout, $location, $http, AppSettings, SearchService,MapPopUpTemplateService) {

    var vm = this;
    var flag = false;
    var term = '';
    $scope.wallOptions = {};
    $scope.wallOptions.headerColour = '#3c8dbc';
    $scope.wallOptions.headerPosition = 'Top';
    $scope.wallOptions.layoutStyle = 1;

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
        if ($scope.wallOptions.headerColour)
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
        //construct term
        term = $scope.wallOptions.mainHashtag;
        for (var i = 0; i < $scope.wallOptions.allWords.length; i++) {
            term = term + ' ' + $scope.wallOptions.allWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.anyWords.length; i++) {
            term = term + ' ' + $scope.wallOptions.anyWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.noWords.length; i++) {
            term = term + ' -' + $scope.wallOptions.noWords[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.allHashtags.length; i++) {
            term = term + ' #' + $scope.wallOptions.allHashtags[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.from.length; i++) {
            term = term + ' from:' + $scope.wallOptions.from[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.to.length; i++) {
            term = term + ' @' + $scope.wallOptions.to[i].text;
        };
        for (var i = 0; i < $scope.wallOptions.mentioning.length; i++) {
            term = term + ' @' + $scope.wallOptions.mentioning[i].text;
        };
        if ($scope.wallOptions.images) {
            if ($scope.wallOptions.images == "only") {
                term = term + ' /image';
            } else if ($scope.wallOptions.images == "none") {
                term = term + ' -/image';
            }
        }
        if ($scope.wallOptions.videos) {
            if ($scope.wallOptions.videos == "only") {
                term = term + ' /video';
            } else if ($scope.wallOptions.videos == "none") {
                term = term + ' -/video';
            }
        }
        if ($scope.wallOptions.audio) {
            if ($scope.wallOptions.audio == "only") {
                term = term + ' /audio';
            } else if ($scope.wallOptions.audio == "none") {
                term = term + ' -/audio';
            }
        }
        if ($scope.wallOptions.sinceDate) {
            term = term + ' since:' + moment($scope.wallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }
        if ($scope.wallOptions.untilDate) {
            term = term + ' until:' + moment($scope.wallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }
        $scope.wallOptions['term'] = term;
        $('#wall-modal').modal('toggle');
        $("#wall-modal").on('hidden.bs.modal', function() {
            if (flag == true) {
                flag = false;
                console.log('here');
                $location.path('/wall/display').search($scope.wallOptions);
                $scope.$apply();
            }
        });
        flag = true;
    };


    $scope.resetDate = function() {
        $scope.wallOptions.sinceDate = null;
        $scope.wallOptions.untilDate = null;
    }

}

controllersModule.controller('WallCtrl', ['$scope', '$window', '$stateParams', '$interval', '$timeout', '$location', '$http', 'AppSettings', 'SearchService','MapPopUpTemplateService', WallCtrl]);
