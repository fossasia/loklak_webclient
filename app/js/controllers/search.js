'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$scope', '$rootScope', '$stateParams', '$timeout', '$location', '$http', '$filter', 'AppSettings', 'SearchService', function($scope, $rootScope, $stateParams, $timeout, $location, $http, $filter, AppSettings, SearchService) {

    var vm = this;
        vm.modal = { text: "Tweet content placeholder"};
        vm.currentFilter = 'live';
        vm.showDetail = false;
        vm.showResult = false;
        vm.searchFilters = ['live', 'photos', 'videos'];
        vm.term = '';

        // Init model related to modal
        // Used in body tag and for toggling modal
        $rootScope.root.tweetModalShow = false;

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

        // Update status and path on success search
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

        /**
         * Filter result based on given filter
         *
         */
        var filterToQuery = {
            'live': '',
            'photos': '/image',
            'videos': '/video',
        };

        var queryToFilter = (function() {
              var ret = {};
              for(var key in filterToQuery){
                ret[filterToQuery[key]] = key;
              }
              return ret;
        })();

        vm.filterSearch = function(filter) {
            if (filter !== vm.currentFilter) {
                vm.currentFilter = filter;
                var newTerm = setNewTerm();
                vm.update(newTerm);
            }
        };

        /**
         * Given status object
         * Popuplate the modal data
         * Change state of the template search-modal.html
         */
        // To do, add onclick and ESC to close modal
        
        
        vm.showModal = function(data) {
            vm.modal = data;
            $rootScope.root.tweetModalShow = !$rootScope.root.tweetModalShow;
        };

        /**
         * Create photoswipe
         * Lib's docs: http://photoswipe.com/documentation/getting-started.html
         */
        vm.openSwipe = function(status_id) {
            var items = [];
            var images  = angular.element('#' + status_id + ' .images-wrapper img');        
            angular.forEach(images, function(image) {
                this.push(scrapeImgTag(image));
            }, items);
            var options = {       
                index: 0,
                history: false,
            };
            var swipeEle = document.querySelectorAll('.pswp')[0];
           
            var swipeObject = 'gallery' + status_id;

            $timeout(function() {
                window[swipeObject] = new PhotoSwipe(swipeEle, PhotoSwipeUI_Default, items, options);
                window[swipeObject].init();    
            }, 0);
        };


        /** 
         * Similar to openSwipe
         * With an extra step to close modal first
         */
        vm.switchToSwipe = function(status_id) {
            $rootScope.root.tweetModalShow = !$rootScope.root.tweetModalShow;
            vm.openSwipe(status_id);
        };

        // Populate modal template with given tweet data 

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

        function evalSearchQuery() {
            var queryParts = $location.search().q.split('+');
            vm.term = queryParts[0];
            vm.currentFilter = (queryParts[1]) ? queryToFilter[queryParts[1]] : 'live';
        }

        function setNewTerm() {
            return (vm.currentFilter === 'live') ? vm.term : vm.term + '+' + filterToQuery[vm.currentFilter];
        }
}]);