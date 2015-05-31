'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function WallCtrl($scope, $stateParams, $interval, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
    vm.term = null;
    vm.allStatuses = [];
    vm.nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;
    vm.searchQuery = $location.search().q;
    console.log(vm.searchQuery);

    // /*
    //  * Change url on search for sharing
    //  */
    // vm.newSearch = function() {
    //     $location.url($location.path());
    // };

    // /* 
    //  * Negative filter old status based of its ID
    //  * Return an array of new statuses
    //  */
    // var getNewStatuses = function(oldStatuses, newStatuses) {
    //     var oldIds = {};
    //     oldStatuses.forEach(function(status) {
    //         oldIds[status.id_str] = status;
    //     });

    //     return newStatuses.filter(function(status) {
    //         return !(status.id_str in oldIds);
    //     });
    // };

    // /* 
    //  * Period is from the 1st status to 100th status in the result
    //  * Return timeout for next req based on the current period
    //  */

    var getRefreshTime = function(period) {
        if(period < 7000) {
            return 5000;
        }
        if(period <= 3000) {
            return 0.7 * period;
        }
        return 20000;
    };

    // /* 
    //  * Recursively request with different timeout child processes
    //  * Timout is updated after every request based on the new period
    //  * 
    //  */
    // var liveUpdate = function(refreshTime) {
    //     return $timeout(function() {
    //         SearchService.getData(vm.term)
    //             .then(function(data) {
    //                 var newRefreshTime = getRefreshTime(data.search_metadata.period);
    //                 var newStatuses = [];

    //                 if(vm.prevStatuses.length === 0) {
    //                     newStatuses = data.statuses;
    //                     var len = newStatuses.length;
    //                     for (var index=0; index < len; index++) {
    //                         var profileURLString = newStatuses[index].user.profile_image_url_https;
    //                         //try{
    //                         var splitURL = profileURLString.split('_bigger');
    //                         //console.log();
    //                         newStatuses[index].user.profile_image_url = splitURL[0]+splitURL[1];    
    //                         //}
    //                         // catch(ex){
    //                         //     console.log(profileURLString);
    //                         // }

    //                     }
    //                 } else {
    //                     newStatuses = getNewStatuses(vm.prevStatuses, data.statuses);
    //                 }

    //                 angular.forEach(newStatuses, function(status) {
    //                     vm.nextStatuses.unshift(status);
    //                 });

    //                 vm.prevStatuses = data.statuses;
    //                 return liveUpdate(newRefreshTime);
    //             });
    //     }, refreshTime);
    // };

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

    // /* 
    //  * Get img tag attr 
    //  * Return in objects
    //  */
    // function scrapeImgTag(imgTag) {
    //     var ngEle = angular.element(imgTag);
    //     return {
    //         src: ngEle.attr('src'),
    //         w: parseInt(ngEle.css('width').replace('px', '')),
    //         h: parseInt(ngEle.css('height').replace('px', ''))
    //     };
    // }

    // /*
    //  * Update on click/search
    //  */
    // vm.update = function(term) {
    //     if(!term) {
    //         return;
    //     }

    //     vm.displaySearch = false;
    //     vm.term = term;
    //     liveUpdate(0);
    // };

    // /* 
    //  * Update url on search/click
    //  */
    // vm.urlupdate = function (term) {
    //     if(!term) {
    //         return;
    //     }

    //     vm.displaySearch = false;
    //     vm.term = term;
    //     liveUpdate(0);
    // };


    // // Init wall on search url
    // if(vm.searchQuery) {
    //     vm.term = vm.searchQuery;

    //     $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
    //       params: {q: vm.term}
    //     }).success(function(data) { // jshint ignore:line
    //         vm.update(vm.term);
    //     }).error(function(err, status) { // jshint ignore:line
    //         console.log("Throwing error HTTP Request.");
    //     });
    // }
    // var size = 0;
    // // Periodically insert new statuses
    // // Create photoswipe from new statuses
    // var interval = $interval(function() { // jshint ignore:line
    //     if(vm.nextStatuses.length === 0) {
    //         return;
    //     }
    //     // if(size<3)
    //     // {
    //         vm.statuses.unshift(vm.nextStatuses[0]);
    //         vm.nextStatuses.shift();
    //         size++;
    //    // }

    // }, 3000);
    
    function contains(Statuses, status_id){
        for (var i = 0; i < Statuses.length; i++) {
            if(Statuses[i]===status_id)
                return true;
        };
        return false;
    }

    function compare(a,b){
        if(a.created_at<b.created_at)
            return -1;
        else if(a.created_at>b.created_at)
            return 1;
        return 0;
    }

    var maxStatusCount = 3;

    vm.update = function(refreshTime) {
        return $timeout(function() {
            SearchService.getData(vm.searchQuery).then(function(data) {
                //console.log(data);
                alert("wohoo");
                if(data.statuses){
                    for (var i = data.statuses.length - 1; i >= 0; i--) {
                        if(!contains(vm.allStatuses, data.statuses[i].id_str)){
                            try
                            {
                                var profileURLString = data.statuses[i].user.profile_image_url_https;
                                var splitURL = profileURLString.split('_bigger');
                                data.statuses[i].user.profile_image_url = splitURL[0]+splitURL[1];    
                                vm.nextStatuses.push(data.statuses[i]);
                                vm.allStatuses.push(data.statuses[i].id_str);
                            }
                            catch(ex)
                            {

                            }
                            
                        }
                    };                    
                }
                vm.nextStatuses.sort(compare);
                var newRefreshTime = getRefreshTime(data.search_metadata.period);
                vm.update(newRefreshTime);
            }, function(error) {

            });            
        }, refreshTime);
        
    };

    $scope.proceed = function() {
        console.log("clicked");
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        console.log($scope.wallOptions);
        $location.path('/wall/display');
        vm.update("loklak");
    };

    var interval = $interval(function() { // jshint ignore:line
        if(vm.nextStatuses.length === 0) {
            return;
        }
        // if(size<3)
        // {
            vm.statuses.unshift(vm.nextStatuses.pop());
            if(vm.statuses.length>maxStatusCount)
                vm.statuses.pop();
           // vm.nextStatuses.shift();
            console.log(vm.statuses[0].text);
            // vm.nextStatuses.shift();
            // size++;
       // }

    }, 3000);


    //On INIT
    vm.update(0);


}

controllersModule.controller('WallCtrl', WallCtrl);
