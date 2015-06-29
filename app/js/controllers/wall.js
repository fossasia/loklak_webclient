'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallCtrl($scope, $window, $stateParams, $interval, $timeout, $location, $http, AppSettings, AccountsService,MapPopUpTemplateService) {

    var vm = this;
    var flag = false;
    var term = '';
    $scope.newWallOptions = {};
    $scope.newWallOptions.headerColour = '#3c8dbc';
    $scope.newWallOptions.headerPosition = 'Top';
    $scope.newWallOptions.layoutStyle = 1;

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

    $scope.$watch('newWallOptions.headerColour', function() {
        if ($scope.newWallOptions.headerColour)
            $scope.newWallOptions.headerForeColour = colourCalculator(hexToRgb($scope.newWallOptions.headerColour));
    });

    $scope.$watch('newWallOptions.mainHashtagText', function() {
        if ($scope.newWallOptions.mainHashtagText)
            if ($scope.newWallOptions.mainHashtagText.length !== 0) {
                if ($scope.newWallOptions.mainHashtagText[0] != '#') {
                    $scope.newWallOptions.mainHashtag = '#' + $scope.newWallOptions.mainHashtagText;
                } else {
                    $scope.newWallOptions.mainHashtag = $scope.newWallOptions.mainHashtagText;
                }
            }
    });

    $scope.proceed = function() {
        console.log("clicked");
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //$scope.newWallOptions.allWords = JSON.stringify($scope.newWallOptions.allWords);
        //construct term
        var dataParams = encodeURI(JSON.stringify($scope.newWallOptions));
        // term = $scope.newWallOptions.mainHashtag;
        // for (var i = 0; i < $scope.newWallOptions.allWords.length; i++) {
        //     term = term + ' ' + $scope.newWallOptions.allWords[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.anyWords.length; i++) {
        //     term = term + ' ' + $scope.newWallOptions.anyWords[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.noWords.length; i++) {
        //     term = term + ' -' + $scope.newWallOptions.noWords[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.allHashtags.length; i++) {
        //     term = term + ' #' + $scope.newWallOptions.allHashtags[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.from.length; i++) {
        //     term = term + ' from:' + $scope.newWallOptions.from[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.to.length; i++) {
        //     term = term + ' @' + $scope.newWallOptions.to[i].text;
        // };
        // for (var i = 0; i < $scope.newWallOptions.mentioning.length; i++) {
        //     term = term + ' @' + $scope.newWallOptions.mentioning[i].text;
        // };
        // if ($scope.newWallOptions.images) {
        //     if ($scope.newWallOptions.images == "only") {
        //         term = term + ' /image';
        //     } else if ($scope.newWallOptions.images == "none") {
        //         term = term + ' -/image';
        //     }
        // }
        // if ($scope.newWallOptions.videos) {
        //     if ($scope.newWallOptions.videos == "only") {
        //         term = term + ' /video';
        //     } else if ($scope.newWallOptions.videos == "none") {
        //         term = term + ' -/video';
        //     }
        // }
        // if ($scope.newWallOptions.audio) {
        //     if ($scope.newWallOptions.audio == "only") {
        //         term = term + ' /audio';
        //     } else if ($scope.newWallOptions.audio == "none") {
        //         term = term + ' -/audio';
        //     }
        // }
        // if ($scope.newWallOptions.sinceDate) {
        //     term = term + ' since:' + moment($scope.newWallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        // }
        // if ($scope.newWallOptions.untilDate) {
        //     term = term + ' until:' + moment($scope.newWallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        // }
        $scope.newWallOptions['term'] = term;
        $('#wall-modal').modal('toggle');
        $("#wall-modal").on('hidden.bs.modal', function() {
            if (flag == true) {
                flag = false;
                console.log('here');
                AccountsService.updateData(dataParams);
                $location.path('/wall/display').search({data: dataParams});
                $scope.$apply();
            }
        });
        flag = true;
    };


    $scope.resetDate = function() {
        $scope.newWallOptions.sinceDate = null;
        $scope.newWallOptions.untilDate = null;
    }
}

controllersModule.controller('WallCtrl', ['$scope', '$window', '$stateParams', '$interval', '$timeout', '$location', '$http', 'AppSettings', 'AccountsService','MapPopUpTemplateService', WallCtrl]);
