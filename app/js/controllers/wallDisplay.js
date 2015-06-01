'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function WallDisplay($scope, $stateParams, $interval, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
    vm.term = null;
    vm.allStatuses = [];
    vm.nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;
    vm.searchQuery = $location.search().q;
    vm.eventName = $location.search().eventName;
    console.log($location.search());
    console.log(vm.searchQuery);
    for (var property in $location.search()) {
        if ($location.search().hasOwnProperty(property)) {
            vm[property] = $location.search()[property];
        }
    }

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
    function scrapeImgTag(imgTag) {
        var ngEle = angular.element(imgTag);
        return {
            src: ngEle.attr('src'),
            w: parseInt(ngEle.css('width').replace('px', '')),
            h: parseInt(ngEle.css('height').replace('px', ''))
        };
    }

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
                //alert("wohoo");
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
            //console.log(vm.statuses[0].text);
            // vm.nextStatuses.shift();
            // size++;
       // }

    }, 3000);


    //On INIT
    vm.update(0);


}

controllersModule.controller('WallDisplay', WallDisplay);
