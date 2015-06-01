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

    $scope.proceed = function() {
        console.log("clicked");
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        console.log($scope.wallOptions);
        $location.path('/wall/display');
    };
}

controllersModule.controller('WallCtrl', WallCtrl);
