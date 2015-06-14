'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallDisplay($scope, $stateParams, $interval, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
    vm.term = null;
    var allStatuses = [];
    var nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;
    vm.wallOptions = $location.search();
    var term = vm.wallOptions.mainHashtag;
    for (var word in vm.wallOptions.allWords){
        term = term + " " + word;
    }
    if (vm.wallOptions.images) {
        if(vm.wallOptions.images=="only"){
            term = term + ' /image';    
        }
        else if(vm.wallOptions.images=="none"){
            term = term + ' -/image';    
        }    
    }
    if (vm.wallOptions.videos) {
        if(vm.wallOptions.videos=="only"){
            term = term + ' /video';    
        }
        else if(vm.wallOptions.videos=="none"){
            term = term + ' -/video';    
        }    
    }
    if (vm.wallOptions.audio) {
        if(vm.wallOptions.audio=="only"){
            term = term + ' /audio';    
        }
        else if(vm.wallOptions.audio=="none"){
            term = term + ' -/audio';    
        }    
    }
    if (vm.wallOptions.sinceDate) {
        term = term + ' since:' + moment(vm.wallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
    }
    if (vm.wallOptions.untilDate) {
        term = term + ' until:' + moment(vm.wallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
    }
    var maxStatusCount = 0;
    if (vm.wallOptions.layoutStyle == 1)
        maxStatusCount = 3; //linear
    else if (vm.wallOptions.layoutStyle == 2)
        maxStatusCount = 10; //masonry
    else if (vm.wallOptions.layoutStyle == 3)
        maxStatusCount = 1; //single

    var getRefreshTime = function(period) {
        if (period < 7000) {
            return 3000;
        }
        if (period <= 3000) {
            return 0.7 * period;
        }
        return 5000;
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
        var images = angular.element('#' + status_id + ' .masonry-brick img');
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

    // /* 
    //  * Get img tag attr 
    //  * Return in objects
    //  */
    function scrapeImgTag(imgTag) {
        var ngEle = angular.element(imgTag);
        return {
            src: ngEle.attr('src'),
            w: parseInt(ngEle.css('width').replace('px', '')),
            h: parseInt(ngEle.css('height').replace('px', ''))
        };
    }

    function contains(Statuses, status_id) {
        for (var i = 0; i < Statuses.length; i++) {
            if (Statuses[i] === status_id)
                return true;
        };
        return false;
    }

    function compare(a, b) {
        if (a.created_at < b.created_at)
            return -1;
        else if (a.created_at > b.created_at)
            return 1;
        return 0;
    }

    vm.update = function(refreshTime) {
        return $timeout(function() {
            SearchService.getData(term).then(function(data) {
                if (data.statuses) {
                    for (var i = data.statuses.length - 1; i >= 0; i--) {
                        if (!contains(allStatuses, data.statuses[i].id_str)) {
                            try {
                                // var profileURLString = data.statuses[i].user.profile_image_url_https;
                                // var splitURL = profileURLString.split('_bigger');
                                // data.statuses[i].user.profile_image_url = splitURL[0] + splitURL[1];
                                nextStatuses.push(data.statuses[i]);
                                allStatuses.push(data.statuses[i].id_str);
                            } catch (ex) {

                            }

                        }
                    };
                }
                nextStatuses.sort(compare);
                var newRefreshTime = getRefreshTime(data.search_metadata.period);
                vm.update(newRefreshTime);
            }, function(error) {

            });
        }, refreshTime);

    };

    vm.update2 = function(refreshTime) {
        return $timeout(function() {
            SearchService.getData(term).then(function(data) {
                if (data.statuses) {
                    if(vm.statuses.length <=0){
                        vm.statuses = data.statuses.splice(0,3);
                        nextStatuses = vm.statuses;
                    }
                    else {
                        for (var i = data.statuses.length-1; i > -1; i--) {
                            if(data.statuses[i].created_at > vm.statuses[0].created_at) {
                                vm.statuses.unshift(data.statuses[i]);
                                vm.statuses.pop();
                            }
                        };
                    }
                    // for (var i = 0; i < data.statuses.length; i++) {
                    //     if (!contains(allStatuses, data.statuses[i].id_str)) {
                    //         if (vm.statuses <= 0) {
                    //             vm.statuses = da
                    //         }
                    //     }
                    // };
                }
                //nextStatuses.sort(compare);
                var newRefreshTime = getRefreshTime(data.search_metadata.period);
                vm.update2(newRefreshTime);
            }, function(error) {

            });
        }, refreshTime);
    }

    var tweetRefreshTime = 4000;

    // var interval = $interval(function() { // jshint ignore:line
    //     if (nextStatuses.length === 0) {
    //         return;
    //     }

    //     vm.statuses.unshift(nextStatuses.shift());
    //     if (vm.statuses.length > maxStatusCount)
    //         vm.statuses.pop();
    // }, tweetRefreshTime);

    var showTweets = function() {

    };

    //On INIT
    vm.update2(0);


}

controllersModule.controller('WallDisplay', ['$scope', '$stateParams', '$interval', '$timeout', '$location', '$http', 'AppSettings', 'SearchService', WallDisplay]);
