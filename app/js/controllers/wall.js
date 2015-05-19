'use strict';

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');

/**
 * @ngInject
 */

function WallCtrl($http, $location, $timeout, $interval, AppSettings, SearchService) {
    var vm = this;
    vm.term = null;
    vm.prevStatuses = [];
    vm.nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;
    vm.searchQuery = $location.search().q;

    /*
     * Change url on search for sharing
     */
    vm.newSearch = function() {
        $location.url($location.path());
    };

    /* 
     * Negative filter old status based of its ID
     * Return an array of new statuses
     */
    var getNewStatuses = function(oldStatuses, newStatuses) {
        var oldIds = {};
        oldStatuses.forEach(function(status) {
            oldIds[status['id_str']] = status;
        });

        return newStatuses.filter(function(status) {
            return !(status['id_str'] in oldIds);
        });
    };

    /* 
     * Period is from the 1st status to 100th status in the result
     * Return timeout for next req based on the current period
     */

    var getRefreshTime = function(period) {
        if(period < 7000) return 5000;
        if(period <= 3000) return 0.7 * period;
        return 20000;
    }

    /* 
     * Recursively request with different timeout child processes
     * Timout is updated after every request based on the new period
     * 
     */
    var liveUpdate = function(refreshTime) {
        return $timeout(function() {
            SearchService.getData(vm.term)
                .then(function(data) {
                    var newRefreshTime = getRefreshTime(data.search_metadata.period);
                    var newStatuses = [];

                    if(vm.prevStatuses.length === 0) {
                        newStatuses = data.statuses;
                    } else {
                        newStatuses = getNewStatuses(vm.prevStatuses, data.statuses);
                    }
                    
                    angular.forEach(newStatuses, function(status) {
                        vm.nextStatuses.unshift(status);
                    });

                    vm.prevStatuses = data.statuses;
                    return liveUpdate(newRefreshTime);
                });
        }, refreshTime);
    };

    /*
     * Create photoswipe
     * Lib's docs: http://photoswipe.com/documentation/getting-started.html
     */
    vm.open = function(status_id) {
        //$interval.cancel(interval);
        console.log("Foobar");
        // Populating args
        var items = [];
        var images  = angular.element('#' + status_id + ' .masonry-brick img');        
        angular.forEach(images, function(image) {
            this.push(scrapeImgTag(image));
        }, items);
        var options = {       
            index: 0
        };
        var swipeEle = document.querySelectorAll('.pswp')[0];
       
        var swipeObject = 'gallery' + status_id;

        $timeout(function() {
            window[swipeObject] = new PhotoSwipe(swipeEle, PhotoSwipeUI_Default, items, options);
            window[swipeObject].init();    
        }, 0);
    };

    /* 
     * Get img tag attr 
     * Return in objects
     */
    function scrapeImgTag(imgTag) {
        var ngEle = angular.element(imgTag);
        return {
            src: ngEle.attr('src'),
            w: parseInt(ngEle.css('width').replace('px', '')),
            h: parseInt(ngEle.css('height').replace('px', ''))
        };
    }

    /*
     * Update on click/search
     */
    vm.update = function(term) {
        if(!term) return;

        vm.displaySearch = false;
        vm.term = term;
        liveUpdate(0);
    };

    /* 
     * Update url on search/click
     */
    vm.urlupdate = function (term) {
        if(!term) return;

        vm.displaySearch = false;
        vm.term = term;
        liveUpdate(0);
    };


    // Init wall on search url
    if(vm.searchQuery) {
        vm.term = vm.searchQuery;

        $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
          params: {q: vm.term}
        }).success(function(data) {
            vm.update(vm.term)
        }).error(function(err, status) {
            console.log("Throwing error HTTP Request.");
        });
    }

    // Periodically insert new statuses
    // Create photoswipe from new statuses
    var interval = $interval(function() {
        if(vm.nextStatuses.length === 0) return;
        vm.statuses.unshift(vm.nextStatuses[0]);
        vm.nextStatuses.shift();
    }, 3000);



    
}

controllersModule.controller('WallCtrl', WallCtrl);