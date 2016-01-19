'use strict';
/* global angular, alert, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallCtrl($scope, $rootScope, $window, AppsService, HelloService, SearchService) {

    var vm = this;
    var term = '';
    var isEditing = -1;
    $scope.wallsPresent = true;
    $scope.invalidFile = false;
    $scope.showNext = true;
    $scope.selectedTab = 0;

    /*
     * Location UI component
     * If user input > 3 chars, suggest location
     * clicking on suggested location assign value to the according model
     */

    $scope.$watch('newWallOptions.chosenLocation', function() {
        if (document.activeElement.className.indexOf("wall-location-input") > -1) {
            if ($scope.newWallOptions.chosenLocation && $scope.newWallOptions.chosenLocation.length >= 3) {
                SearchService.getLocationSuggestions($scope.newWallOptions.chosenLocation).then(function(data) {
                    vm.hasSuggestions = true;
                    vm.locationSuggestions = data.queries;
                    angular.element($('.wall-location-list')).width(($('wall-location-input').width()));
                }, function(e) {
                    vm.hasSuggestions = false;
                    console.log(e);
                });
            } else {
                vm.hasSuggestions = false;
            }
        }
    });

    vm.setLocation = function(locationTerm) {
        $scope.newWallOptions.chosenLocation = locationTerm;
        vm.hasSuggestions = false;
    };

    var initWallOptions = function() {
        $scope.newWallOptions = {};
        $scope.newWallOptions.profanity = true;
        $scope.newWallOptions.images = true;
        $scope.newWallOptions.videos = false;
        $scope.newWallOptions.headerColour = '#3c8dbc';
        $scope.newWallOptions.headerForeColour = '#FFFFFF';
        $scope.newWallOptions.headerPosition = 'Top';
        $scope.newWallOptions.layoutStyle = 1;
        $scope.newWallOptions.showLoading = false;
        $scope.newWallOptions.showStatistics = true;
        $scope.newWallOptions.showLoklakLogo = true;
        $scope.newWallOptions.showEventName = true;
    };

    $scope.tabSelected = function(index) {
        $scope.selectedTab = index;
        if (index === 2) {
            $scope.showNext = false;
        } else {
            $scope.showNext = true;
        }
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
                $scope.invalidFile = false;
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

    $scope.$watch('newWallOptions.images', function() {
        if ($scope.newWallOptions.images) {
            if ($scope.newWallOptions.images === 'only') {
                $scope.newWallOptions.videos = ['none'];
            }
        }
    });

    $scope.$watch('newWallOptions.videos', function() {
        if ($scope.newWallOptions.videos) {
            if ($scope.newWallOptions.videos === 'only') {
                $scope.newWallOptions.images = ['none'];
            }
        }
    });

    $scope.proceed = function() {
        if ($scope.selectedTab === 1 && $scope.newWallOptions.cycle && !$scope.newWallOptions.cyclePostLimit || ($scope.newWallOptions.cyclePostLimit < 1) || ($scope.newWallOptions.cyclePostLimit > 100)) {
            alert("Invalid cycle post limit! Please enter a value between 1 and 100. We have set it to the recommended value.");
            $scope.newWallOptions.cyclePostLimit = 15;
        } else {
            if ($scope.selectedTab === 1 && $scope.newWallOptions.cycle && !$scope.newWallOptions.cycleDelayTime || ($scope.newWallOptions.cycleDelayTime < 1) || ($scope.newWallOptions.cycleDelayTime > 20)) {
                alert("Invalid cycle delay time! Please enter a value between 1 and 20. We have set it to the recommended value.");
                $scope.newWallOptions.cycleDelayTime = 5;
            } else {
                $scope.selectedTab++;
                $('.nav-tabs > .active').next('li').find('a').trigger('click');
                if ($scope.selectedTab === 2) {
                    $scope.showNext = false;
                }
            }

        }

    };


    $scope.lostCycleDelayFocus = function() {
        // if(!$scope.newWallOptions.cyclePostLimit || ($scope.newWallOptions.cyclePostLimit<1) || ($scope.newWallOptions.cyclePostLimit>20)){
        //     $scope.newWallOptions.cyclePostLimit = 15;
        // }
    };

    $scope.lostCyclePostsFocus = function() {
        // if(!$scope.newWallOptions.cycleDelayTime || ($scope.newWallOptions.cycleDelayTime<1) || ($scope.newWallOptions.cycleDelayTime>100)){
        //     $scope.newWallOptions.cycleDelayTime = 5;
        // }
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
            if (isEditing !== -1) {
                $scope.userWalls[isEditing].showLoading = true;
                for (k in $scope.newWallOptions) {
                  if($scope.newWallOptions.hasOwnProperty(k)){
                    $scope.userWalls[isEditing][k] = $scope.newWallOptions[k];
                  }
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
                      if($scope.newWallOptions.hasOwnProperty(k)){
                        $scope.userWalls[$scope.userWalls.length - 1][k] = $scope.newWallOptions[k];
                      }
                    }
                    $scope.wallsPresent = true;
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
    };

    $scope.deleteWall = function(index) {
        //console.log(index);
        $scope.userWalls[index].showLoading = true;
        $scope.userWalls[index].$delete({
            user: $scope.screen_name,
            app: 'wall'
        }, function(data) {
            $scope.userWalls[index].showLoading = false;
            $scope.userWalls.splice(index, 1);
            if ($scope.userWalls.length === 0) {
                $scope.wallsPresent = false;
            }
            //$scope.userWalls[index].showLoading = false;
        });
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
    };

    var init = function() {

        if ($rootScope.root.twitterSession) {
            var auth = HelloService('twitter').getAuthResponse();
            $scope.screen_name = auth.screen_name;
            $scope.userWalls = AppsService.query({
                user: auth.screen_name,
                app: 'wall'
            }, function(result) {
                if ($scope.userWalls.length === 0) {
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
            if ($scope.userWalls.length === 0) {
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

controllersModule.controller('WallCtrl', ['$scope', '$rootScope', '$window', 'AppsService', 'HelloService', 'SearchService', WallCtrl]);
