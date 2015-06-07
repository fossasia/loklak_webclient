'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function WallCtrl($scope, $stateParams, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
}

controllersModule.controller('WallCtrl', ['$scope', '$stateParams', '$timeout', '$location', '$http', 'AppSettings', WallCtrl]);