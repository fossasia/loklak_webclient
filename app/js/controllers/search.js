'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */
function SearchCtrl($scope, $rootScope, $stateParams, $timeout, $location, $http, AppSettings, SearchService) {

    var vm = this;
    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;

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
              console.log(data);
               vm.statuses = data.statuses;
               vm.showResult = true;
               updatePath(term);
            },
            function() {
             console.log('statuses retrieval failed.');
            });
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
        //$interval.cancel(interval);
        console.log("Foobar");
        // Populating args
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
    }

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
    function updatePath(term) {
      $location.search({
        q: encodeURIComponent(term), 
        timezoneOffset: (new Date()).getTimezoneOffset()
      });
    }


    

}

controllersModule.controller('SearchCtrl', SearchCtrl);