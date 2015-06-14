'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$scope', '$rootScope', '$stateParams', '$timeout', '$location', '$http', '$filter', 'AppSettings', 'SearchService', function($scope, $rootScope, $stateParams, $timeout, $location, $http, $filter, AppSettings, SearchService) {

    // Define models here
    var vm = this;
    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.searchFilters = ['live', 'photos'];
    vm.term = '';

    //Other vars
    var filterToQuery = { 'live': '', 'photos': '/image'};
    var queryToFilter = (function() { // Just the reversed object of the above
          var ret = {};
          for(var key in filterToQuery){
            ret[filterToQuery[key]] = key;
          }
          return ret;
    })();

        
    // Init statues if path is a search url
    angular.element(document).ready(function() {
      if ($stateParams.q !== undefined) {
          SearchService.initData($stateParams)
             .then(function(data) {
               vm.statuses = data.statuses;
               vm.showResult = true;
               evalSearchQuery();
             },
             function() {
               console.log('statuses init retrieval failed');
             });   
      }
    });

    // Update status and path on successful search
    vm.update = function(term) {
        SearchService.getData(term)
            .then(function(data) {
               vm.statuses = data.statuses;
               vm.showResult = true;
               updatePath(term);
               evalSearchQuery();
            },
            function() {
             console.log('statuses retrieval failed.');
            });
    };


    // Filter result based on given filter
    vm.filterSearch = function(filter) {
        if (vm.currentFilter === "live" && filter !== "live") {
            console.log("Foo");
            vm.originStatuses = JSON.parse(JSON.stringify(vm.statuses));
        }
        if (filter !== vm.currentFilter) {
            vm.currentFilter = filter;
            var newTerm = setNewTerm();
            vm.update(newTerm);
        }
    };

    // Filter videos, can't be used with 
    vm.filterVideos = function() {
        vm.currentFilter = "videos";

        if (vm.currentFilter === "live") {
            // Storing original result for videos filter
            vm.statuses = vm.statues.filter(function(status) {
                return status.isVideo;
            });    
        } else {
            vm.statuses = vm.originStatuses.filter(function(status) {
                return status.isVideo;
            });    
        }
        
    };

    // Create photoswipe
    // Lib's docs: http://photoswipe.com/documentation/getting-started.html
    vm.openSwipe = function(status_id) {
        var items = [];
        var images  = angular.element('#' + status_id + ' .images-wrapper img');
        var options = { index: 0, history: false};
        var swipeEle = document.querySelectorAll('.pswp')[0];
        var swipeObject = 'gallery' + status_id;

        angular.forEach(images, function(image) {
            this.push(scrapeImgTag(image));
        }, items);
       
        $timeout(function() {
            window[swipeObject] = new PhotoSwipe(swipeEle, PhotoSwipeUI_Default, items, options);
            window[swipeObject].init();    
        }, 0);
    };


    // HELPERS FN
    ///////////////////

    // Scrape for imgTag to serve photoswipe requirement
    function scrapeImgTag(imgTag) {
        var ngEle = angular.element(imgTag);
        return {
            src: ngEle.attr('src'),
            w: parseInt(ngEle.css('width').replace('px', '')),
            h: parseInt(ngEle.css('height').replace('px', ''))
        };
    }

    // Change stateParams on search
    function updatePath(query) {
      $location.search({
        q: query,
        timezoneOffset: (new Date()).getTimezoneOffset()
      });
    }

    // Evaluate current search query to extract term & filter
    function evalSearchQuery() {
        var queryParts = $location.search().q.split('+');
        vm.term = queryParts[0];
        vm.currentFilter = (queryParts[1]) ? queryToFilter[queryParts[1]] : 'live';
    }

    // Return query for search based on current term & filter
    function setNewTerm() {
        return (vm.currentFilter === 'live') ? vm.term : vm.term + '+' + filterToQuery[vm.currentFilter];
    }
}]);