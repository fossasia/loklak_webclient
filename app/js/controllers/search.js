'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function SearchCtrl($stateParams, $timeout, $location, $http, AppSettings, SearchService) {
    var vm = this;

    // Init statues if path is a search url
    angular.element(document).ready(function() {
        console.log($stateParams);
        console.log($stateParams.timezoneOffset);
         SearchService.initData($stateParams)
            .then(function(data) {
              vm.statuses = data.statuses;
            },
            function() {
              console.log('statuses init retrieval failed');
            });   
    });

    // Change stateParams on search
    function updatePath(term) {
      $location.search({
        q: encodeURIComponent(term), 
        timezoneOffset: (new Date()).getTimezoneOffset()
      });
    }

    // Update status and path on success search
    vm.update = function(term) {
        SearchService.getData(term)
            .then(function(data) {
               vm.statuses = data.statuses;
               updatePath(term);
            },
            function() {
             console.log('statuses retrieval failed.');
            });
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


    

}

controllersModule.controller('SearchCtrl', SearchCtrl);