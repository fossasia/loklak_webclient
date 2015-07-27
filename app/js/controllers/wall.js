'use strict';
/* global angular, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallCtrl($scope, $rootScope, $window, AppsService, HelloService) {

    var vm = this;
    var term = '';
    var isEditing = -1;
    $scope.wallsPresent = true;
    $scope.invalidFile = false;

    var initWallOptions = function() {
        $scope.newWallOptions = {};
        $scope.newWallOptions.headerColour = '#3c8dbc';
        $scope.newWallOptions.headerForeColour = '#FFFFFF';
        $scope.newWallOptions.headerPosition = 'Top';
        $scope.newWallOptions.layoutStyle = 1;
        $scope.newWallOptions.showLoading = false;
    };

    initWallOptions();

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
        if ($scope.newWallOptions.headerColour) {
            $scope.newWallOptions.headerForeColour = colourCalculator(hexToRgb($scope.newWallOptions.headerColour));
        }
    });

    $scope.$watch('newWallOptions.logo', function() {
        if ($scope.newWallOptions.logo) {
            if ($scope.newWallOptions.logo.filesize > 500000) {
                $scope.invalidFile = true;
                delete $scope.newWallOptions.logo;
            } else {
                $scope.invalidFile = false
            }
        }
    });

    $scope.$watch('newWallOptions.mainHashtagText', function() {
        if ($scope.newWallOptions.mainHashtagText) {
            if ($scope.newWallOptions.mainHashtagText.length !== 0) {
                if ($scope.newWallOptions.mainHashtagText[0] !== '#') {
                    $scope.newWallOptions.mainHashtag = '#' + $scope.newWallOptions.mainHashtagText;
                } else {
                    $scope.newWallOptions.mainHashtag = $scope.newWallOptions.mainHashtagText;
                }
            }
        }
    });

    $scope.proceed = function() {
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //construct term
        delete $scope.newWallOptions.link;
        var dataParams = encodeURIComponent(angular.toJson($scope.newWallOptions));
        $('#wall-modal').modal('toggle');
        //console.log($rootScope.root.twitterSession);
        if ($rootScope.root.twitterSession) {
            //save wall
            //console.log("Saving wall");
            var saveData = new AppsService({
                user: $scope.screen_name,
                app: 'wall'
            });
            for (var k in $scope.newWallOptions) {
                saveData[k] = $scope.newWallOptions[k];
            }
            if (isEditing != -1) {
                $scope.userWalls[isEditing].showLoading = true;
                for (var k in $scope.newWallOptions) {
                    $scope.userWalls[isEditing][k] = $scope.newWallOptions[k];
                }
                //$scope.userWalls[isEditing].internal.showLoading = true;
                $scope.userWalls[isEditing].$update({
                    user: $scope.screen_name,
                    app: 'wall'
                }, function(res) {
                    //console.log(result);
                    $scope.userWalls[isEditing].showLoading = false;
                    $window.open('/' + $scope.screen_name + '/wall/' + $scope.userWalls[isEditing].id, '_blank');
                    // $scope.userWalls[isEditing].internal = {};
                    // $scope.userWalls[isEditing].internal.showLoading = false;
                    isEditing = -1;
                    initWallOptions();
                });
            } else {
                $scope.userWalls.push(new AppsService({
                    user: $scope.screen_name,
                    app: 'wall'
                }));
                $scope.userWalls[$scope.userWalls.length - 1].showLoading = true;
                var result = saveData.$save(function(result) {
                    $scope.newWallOptions.id = result.id;
                    console.log(saveData);
                    for (var k in $scope.newWallOptions) {
                        $scope.userWalls[$scope.userWalls.length - 1][k] = $scope.newWallOptions[k];
                    }
                    $window.open('/' + $scope.screen_name + '/wall/' + result.id, '_blank');
                    // $scope.userWalls[$scope.userWalls.length - 1].showLoading = true;
                    initWallOptions();
                });
            }
        } else {
            alert("Please sign in first");
        }
    };

    $scope.resetDate = function() {
        $scope.newWallOptions.sinceDate = null;
        $scope.newWallOptions.untilDate = null;
    };

    $scope.resetLogo = function() {
        $scope.newWallOptions.logo = null;
        //$scope.$apply();
    }

    $scope.deleteWall = function(index) {
        //console.log(index);
        $scope.userWalls[index].showLoading = true;
        $scope.userWalls[index].$delete({
            user: $scope.screen_name,
            app: 'wall'
        }, function(data) {
            $scope.userWalls[index].showLoading = false;
            $scope.userWalls.splice(index, 1);
            if ($scope.userWalls.length == 0)
                $scope.wallsPresent = false;
            //$scope.userWalls[index].showLoading = false;
        });

        // var saveData = {};
        // saveData.screen_name = $scope.screen_name;
        // saveData.apps = $scope.userData;
        // AppsService.updateData(saveData);
    };

    $scope.editWall = function(index) {
        //console.log(index);
        $scope.newWallOptions = $scope.userWalls[index];
        isEditing = index;
        $('#wall-modal').modal('toggle');
    };

    $scope.openModal = function() {
        initWallOptions();
        $('#wall-modal').modal('toggle');
    }

    var init = function() {

        if ($rootScope.root.twitterSession) {
            $scope.screen_name = $rootScope.root.twitterSession.screen_name;
            $scope.userWalls = AppsService.query({
                user: $rootScope.root.twitterSession.screen_name,
                app: 'wall'
            }, function(result) {
                if ($scope.userWalls.length == 0) {
                    $scope.wallsPresent = false;
                    console.log("No walls");
                }
            });
        }
    };

    HelloService.on('auth.login', function(auth) {
        $scope.screen_name = auth.authResponse.screen_name;
        $scope.userWalls = AppsService.query({
            user: auth.authResponse.screen_name,
            app: 'wall'
        }, function(result) {
            console.log($scope.userWalls);
            if ($scope.userWalls.length == 0) {
                $scope.wallsPresent = false;
                console.log("No walls");
            }
        });
    });

    HelloService.on('auth.logout', function() {
        //clear wall list
        $scope.userWalls = [];
    });

    init();

}

controllersModule.controller('WallCtrl', ['$scope', '$rootScope', '$window', 'AppsService', 'HelloService', WallCtrl]);
