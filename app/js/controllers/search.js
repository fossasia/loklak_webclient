'use strict';
/* global angular, L, map */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$stateParams', '$rootScope', '$scope', '$timeout', '$location', '$filter', '$interval', 'SearchService', 'DebugLinkService', 'MapPopUpTemplateService', 'MapCreationService' , function($stateParams, $rootScope, $scope, $timeout, $location, $filter, $interval, SearchService, DebugLinkService, MapPopUpTemplateService, MapCreationService) {

    // Define models here
    var intervals = [];
    var vm = this;
    var prevZoomAction, prevPanAction, newZoomAction, newPanAction;

    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.term = '';
    vm.pool = [];
    vm.statuses = [];
    vm.showingResultInAcc = 9;
    
    $rootScope.root.globalFilter = '';
    

    /*
     * Infinity scroll directive's trigger
     * trigger arg: @amount
     * An @amount of statuses will be concatenated to the current result
     * If the pool of statuses's level is low, get more statuses
     * Is also used to init the shown result
    */
    $scope.loadMore = function(amount) {
        if (!vm.peopleSearch) {
            if (vm.pool.length < (2 * amount + 1)) {
                getMoreStatuses();
            }
            vm.statuses = vm.statuses.concat(vm.pool.slice(0,amount));
            vm.pool = vm.pool.splice(amount);    
        } else {
            vm.showingResultInAcc += amount;
        }   
        
    };

    function getMoreStatuses() {
        if (vm.pool.length > 0) { 
            // Get new time span bound from the lastest status
            var currentUntilBound = new Date(vm.pool[vm.pool.length -1 ].created_at);
            var newUntilBound = new Date(currentUntilBound.getTime() - 1);
            var untilSearchParam = $filter("date")(newUntilBound, "yyyy-MM-dd_HH:mm");
            var newSearchParam = $location.search().q + "+until:" + untilSearchParam;
            var params = {
               q: newSearchParam,
               timezoneOffset: (new Date().getTimezoneOffset())
            };

            // Get new data and concat to the current result
            SearchService.initData(params).then(function(data) {
                   vm.pool = vm.pool.concat(data.statuses);
            }, function() {});    
        }
    }

    /*
     * When a new search is made or the outgoing search is terminated
     * $rootScope.cancelPromise is defined when a search is made from SearchService
     */
    var cancelAllRequest = function() {
        if ($rootScope.httpCanceler) {
            angular.forEach(intervals, function(interval) {
                $interval.cancel(interval);
            });
            $rootScope.httpCanceler.resolve();   
        }
    };

    /*
     * Wrapper for SearchService, including
     * Updating path operation before search
     * Init result with 20 statuses
     * Init a background interval to update the result
     */
    vm.update = function(term) {
        cancelAllRequest();
        updatePath(term);
        SearchService.getData(term).then(function(data) {
               vm.pool = data.statuses;
               vm.statuses = [];
               $scope.loadMore(20);
               vm.showResult = true;
               startNewInterval(data.search_metadata.period);
        }, function() {}); 
    };
    
    ////////
    //// FILTERS FEATURE
    //// filter fn is used as ng-click trigger
    //// a typical filter trigger will include these operation:
    //// - change current filter model;  - show/hide related result according to filter
    //// - request for new result; - update path based on search term & filter
    //// Filter explanation: live = no filter; accounts = show accounts only; 
    //// photos = tweet with native twitter photo + tweet with recognized photo link
    //// video = tweet with native twitter video + tweet with recognized video link
    //// map = no filter, but results are shown on a map
    ////////

    vm.filterLive = function() {
        $rootScope.root.globalFilter = 'live';
        vm.newStasuses = [];
        vm.peopleSearch = false;
        vm.showMap = false;
        var term = vm.term;

        vm.update(term);
    };

    vm.filterAccounts = function() {
        cancelAllRequest();
        $rootScope.root.globalFilter = 'accounts';
        vm.newStasuses = [];
        vm.accountsPretty = [];
        vm.accounts = [];
        var term = vm.term;

        SearchService.initData({q: term, count: 200}).then(function(data) {
            // Get screen_name, then remove duplicates
            data.statuses.forEach(function(ele) { vm.accounts.push(ele.screen_name); });
            vm.accounts = vm.accounts.filter(function(item, pos) { return vm.accounts.indexOf(item) === pos; });
            SearchService.retrieveMultipleImg(vm.accounts).then(function(data) {
                vm.accountsPretty = data.users;
                vm.peopleSearch = true;
                vm.showMap = false;
            }, function() {});
        }, function() {});
        updatePath(vm.term + '+' + '/accounts');
    };

    vm.filterPhotos = function() {
        $rootScope.root.globalFilter = 'photos';
        vm.newStasuses = [];
        vm.statuses = [];
        vm.peopleSearch = false;
        vm.showMap = false; 
        var term = vm.term + '+' + '/image';

        vm.update(term);
    };

    vm.filterVideos = function() {
        cancelAllRequest();
        $rootScope.root.globalFilter = 'videos';
        vm.statuses = [];   
        vm.newStasuses = [];
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.showResult = true;
        // Tweet with native video has a value in this.videos array
        // Move that value to this.links to be evaluated by debugged-link directive
        SearchService.getData(vm.term + '+' + '/video').then(function(data) {
            var statuses = data.statuses;
            var statusesWithVideo = [];
            statuses.forEach(function(status) {
                if (status.videos_count) {
                    if (status.videos[0].substr(-4) === '.mp4') {
                        status.links[0] = status.videos[0];
                    }
                    statusesWithVideo.push(status);
                }
            });
            vm.pool = statusesWithVideo;
            vm.statuses = [];
            $scope.loadMore(15);
            startNewInterval(data.search_metadata.period);
        }, function() {});    

        updatePath(vm.term + '+' + '/video');
    };

    vm.filterMap = function() {
        cancelAllRequest();
        if (window.map) { delete(window.map); }
        vm.newStasuses = [];
        $rootScope.root.globalFilter = "map";
        vm.statuses = [];
        vm.accounts = [];
        vm.showMap = true;
        updatePath(vm.term + '+' + '/map');

        var initialBound = "/location=-282.65625,-77.54209596075546,307.96875,86.40197606876063";
        var params = { q: vm.term + "+" + initialBound, count: 300 };
        SearchService.initData(params).then(function(data) {
            var withoutLocation = [];
            data.statuses.forEach(function(ele, index) {
                if (!ele.location_mark) {
                    withoutLocation.push(data.statuses.splice(index, 1)[0]);
                }
            });

            MapCreationService.initMap({
                data: data.statuses,
                mapId: "search-map",
                markerType: "simpleCircle",
                templateEngine: "genStaticTwitterStatus",
                cbOnMapAction: addListenersOnMap
            });   
            MapCreationService.addLocationFromUser(withoutLocation);
        }, function() {});

        angular.forEach(intervals, function(interval) {
            $interval.cancel(interval);
        });
    };

    /*
     * Helper fn for filters, including
     * A method to update path based on current search term & filter
     * A method to convert current path params => search term & filter
     * A method for vice versa
     */
    function updatePath(query) {
      $location.search({q: query});
      $rootScope.root.globalSearchTerm = vm.term;
    }

    function evalSearchQuery() {
        var queryParts = $location.search().q.split('+');
        var queryToFilter = {
            '/image': 'photos',
            '/video': 'videos',
            '/accounts': 'accounts', 
            '/news' : 'news',
            '/map' : 'map'
        };
        vm.term = queryParts[0];
        $rootScope.root.globalFilter = (queryParts[1]) ? queryToFilter[queryParts[1]] : 'live';
    }

    function filterToQuery(filterName) {
        var filtersToQueries = {
            'photos' : '/image',
            'videos' :'/video',
            'accounts' : '/accounts', 
            'news' : '/news',
            'map' : '/map'
        };
        return filtersToQueries[filterName];
    }


    /*
     * Status's dỉrective openSwipe fn  
     * Clicking on an image results in a photoswipe
     * Docs: http://photoswipe.com/documentation/getting-started.html
     */
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

    function scrapeImgTag(imgTag) {
        var ngEle = angular.element(imgTag);
        return {
            src: ngEle.attr('src'),
            w: parseInt(ngEle.css('width').replace('px', '')),
            h: parseInt(ngEle.css('height').replace('px', ''))
        };
    }

    /*
     * Background process to get newest result, including
     * A fn to get more result, compare created_at and update statuses's pool
     * A method defintion to clear and start a new interval
     * A ng-click trigger to load newest statuses
     */
    var getManuallyNewestStatuses = function() {
        if (vm.statuses[0]) {
            var lastestDateObj = new Date(vm.statuses[0].created_at);
            var term = ($rootScope.root.globalFilter === 'live') ? vm.term : vm.term + '+' + filterToQuery($rootScope.root.globalFilter);
            SearchService.getData(term).then(function(data) {
                var keepComparing = true; var i = 0;
                while (keepComparing) {
                   if (new Date(data.statuses[i].created_at) <= lastestDateObj) {  
                     vm.newStasuses = data.statuses.slice(0, i);
                     vm.noOfNewStatuses = vm.newStasuses.length;
                     keepComparing = false;
                   }
                   i++;
                }
            }, function() {});    
        }
    };

    var startNewInterval = function(period) {
        angular.forEach(intervals, function(interval) {
            $interval.cancel(interval);
        });
        intervals.push($interval(getManuallyNewestStatuses, parseInt(period)));
    };

    vm.showNewStatuses = function() {
        vm.statuses = vm.newStasuses.concat(vm.statuses);
        vm.newStasuses = [];
    };

    /*
     * Add listener on maps' action 
     * When zoom/pan, new /location bound is calculated, and then is used to get & add more map points
     * prevZoomAction, prevPanAction, newZoomAction, newPanAction are used to prevent event bubbling
     */
    function getMoreLocationOnMapAction() {
        var bound = window.map.getBounds();
        var locationTerm = MapCreationService.getLocationParamFromBound(bound);
        var params = { q: vm.term + "+" + locationTerm, count: 300};
        SearchService.initData(params).then(function(data) {
            MapCreationService.addPointsToMap(window.map, MapCreationService.initMapPoints(data.statuses, "genStaticTwitterStatus"), "simpleCircle", addListenersOnMap);    
        }, function(data) {});
    }

    function addListenersOnMap() {
        window.map.on("zoomend", function(event) {
            if (!prevZoomAction) {
                prevZoomAction = new Date();
                getMoreLocationOnMapAction();
            } else {
                newZoomAction = new Date();
                var interval = (newZoomAction - prevZoomAction);
                if (interval > 1000) {
                    getMoreLocationOnMapAction();
                    prevZoomAction = newZoomAction;        
                }
            }   
        });
        window.map.on("dragend", function(event) {
            if (!prevPanAction) {
                prevPanAction = new Date();
                getMoreLocationOnMapAction();
            } else {
                newPanAction = new Date();
                var interval = (newPanAction - prevPanAction);
                if (interval > 1000) {
                    getMoreLocationOnMapAction();
                    prevPanAction = newPanAction;        
                }
            }
        });
    }


    ////////////
    // MANAGING STATE CHANGES RESULTING IN SEARCH
    ///////////

        // On search params in path change
        $scope.$watch(function() {
            return $location.search();
        }, function(value, Oldvalue) {

            if (value.q && value.q.indexOf("id:") > -1) { // When q has "id=.." Leave this for single-tweet view
                return 1; 
            }

            if (value.q && value.q.indexOf("from:") > -1) { // When q has "id=.." Leave this for single-tweet view
                var screen_name = value.q.slice(5); //Get screen_name only
                $location.url("/topology?screen_name=" + encodeURIComponent(screen_name));
                return 1; 
            }

            if (value.q.split("+")[0] !== vm.term) { // Else evaluate path and start search operation
                evalSearchQuery();
                var filterFn = 'filter' + $filter('capitalize')($rootScope.root.globalFilter);
                vm[filterFn]();   
                vm.showResult = true;
            }
            // Edge case: when click on map tweet, but search term stay the same
            // e.g. search for @codinghorror+/map, and then clicking for @codinghorror on the map
            if (value.q.split("+")[0] === Oldvalue.q.split("+")[0] && (Oldvalue.q.split("+")[1] && value.q.split("+")[1] === undefined)) {
                evalSearchQuery();

                SearchService.getData(vm.term).then(function(data) {
                       vm.pool = data.statuses;
                       vm.statuses = [];
                       $scope.loadMore(20);
                       vm.showResult = true;
                       startNewInterval(data.search_metadata.period);
                }, function() {}); 

                $rootScope.root.globalSearchTerm = vm.term;
                vm.showMap = false;
                vm.peopleSearch = false;
                vm.showResult = true;
            }
        });
}]);