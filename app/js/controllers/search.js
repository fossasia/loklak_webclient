'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$stateParams', '$timeout', '$location', '$filter', '$interval', 'SearchService', 'DebugLinkService', function($stateParams, $timeout, $location, $filter, $interval, SearchService, DebugLinkService) {

    // Define models here
    var vm = this;
    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.term = '';
    vm.currentFilter = '';
    var intervalPromise = {};
        
    // Init statuses if path is a search url
    angular.element(document).ready(function() {
        if ($stateParams.q !== undefined) {
            evalSearchQuery();
            var filterFn = 'filter' + $filter('capitalize')(vm.currentFilter);
            vm[filterFn]();   
            vm.showResult = true;
      }
    });

    // Update status and path on successful search
    vm.update = function(term) {
        SearchService.getData(term).then(function(data) {
               vm.statuses = data.statuses;
               vm.showResult = true;
               updatePath(term);
        }, function() {});
    };


    // No filter search
    vm.filterLive = function() {
        vm.peopleSearch = false;
        vm.currentFilter = 'live';
        var term = vm.term;
        vm.update(term);
    };

    // Accounts search
    // Do a normal query, go one by one, check if existed in accounts to add to vm.accounts
    vm.filterAccounts = function() {
        vm.peopleSearch = true;
        vm.currentFilter = 'accounts';
        vm.accounts = [];
        var term = vm.term;
        SearchService.getData(term).then(function(data) {
            data.statuses.forEach(function(ele) {
                var notYetInAccounts = true;
                vm.accounts.forEach(function(account) {
                    if (account.screen_name === ele.screen_name) {
                        return notYetInAccounts = false;
                    }
                })
                if (notYetInAccounts) { vm.accounts.push(ele);}
            })
        }, function() {});

        updatePath(vm.term + '+' + '/accounts');

    };

    // Photos search
    vm.filterPhotos = function() {
        vm.peopleSearch = false;
        vm.currentFilter = 'photos';
        var term = vm.term + '+' + '/image';
        vm.update(term);
    };

    // Videos search
    vm.filterVideos = function() {
        vm.peopleSearch = false;
        vm.statuses = [];   
        vm.currentFilter = 'videos';
        vm.showResult = true;


        // Get native videos
        SearchService.getData(vm.term + '+' + '/video').then(function(data) {
            var statuses = data.statuses;
            statuses.forEach(function(status) {
                if (status.videos_count) {
                    if (status.videos[0].substr(-4) === '.mp4') {
                        status.links[0] = status.videos[0];
                    }
                    vm.statuses.push(status);
                }
            });
        }, function() {});    

        /**
         * Get other videos, enable these when milestones2 comes
         * and loklak_server can't recongize others than youtube and vimeo
         *
        $timeout(SearchService.getData(vm.term).then(function(data) {
            var statuses = data.statuses;
            statuses.forEach(function(status) {
                if (hasExternalLink(status)) {
                    DebugLinkService.debugLink(status.links[0]).then(function(data) {
                        if (data.type === 'video') {
                            insertToStatusesByTimeOrder(status, vm.statuses)
                        }
                    }, function() {return;});
                }
            });
        }, function() {}), 2000);
        */
        
        
        updatePath(vm.term + '+' + '/video');
    };


    // News search
    vm.filterNews = function() {
        vm.peopleSearch = false;
        vm.currentFilter = 'news';
        vm.statuses = [];
        var term = vm.term;

        SearchService.getData(term).then(function(data) {
            data.statuses.forEach(function(status) {
                if (hasExternalLink(status)) {
                    DebugLinkService.debugLink(status.links[0]).then(function(data) {
                        if (data.type === 'link' && data.thumbnail_url) {
                            vm.statuses.push(status);
                        }
                    }, function() {return;});
                }
            })
        }, function() {});

        updatePath(vm.term + '+' + '/news');
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



    /////// Brief process of updating statuses
    // After every search, a interval is called with at least a filter argument
    // The interval process the filter, and latest status to make new request for data accordingly
    // If have new data, show a small notice on top of the current result
    // Click on that notice will concatenate the result with the old one
    // 
    // Create a separate but similar one for accounts since it use different models


    // Background updating process, given a interval and a filter (except for account filter)
    // And a point of time of the lastest status

    // Concat new status with vm.statuses when e.g. ng-click
    vm.showNewStatuses = function() {
        vm.statuses = vm.statuses.concat(vm.newStasuses);
    };


    // HELPERS FN
    ///////////////////

    var bgUpdate = function(interval, filter, since) {
        var sinceDate = $filter('date')(since, 'yyyy-MM-dd');
        $interval.cancel(intervalPromise);
        intervalPromise = $interval(function() {
            var term = vm.term + '+/' + filter + '+' + 'since:=' + sinceDate;
            SearchService.getData(term).then(function(data) {
                vm.newStasuses = data.statuses;
            }, function() {});
        }, interval);
    };

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
        var queryToFilter = {
            '/image': 'photos',
            '/video': 'videos',
            '/accounts': 'accounts', 
            '/news' : 'news'
        };

        vm.term = queryParts[0];
        vm.currentFilter = (queryParts[1]) ? queryToFilter[queryParts[1]] : 'live';
    }

    // Check if a status has external link, twitter pic src is not considered as external
    function hasExternalLink(status) {
        if (!status.links[0]) {
            return false;
        } else if (status.links[0].indexOf('pbs.twimg.com') > -1) {
            return false;
        } else {
            return true;    
        }
    }

    // Insert into status based on time created
    function insertToStatusesByTimeOrder(ele, arr) {
        var eleTime = new Date(ele.created_at);
        for (var i = 0; i < arr.length; i++) {
            if (eleTime > (new Date(arr[i].created_at))) {
                arr.splice(i, 0, arr);
                i = arr.length;
            };
        }
    }
}]);