'use strict';
/* global angular, L, map */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$stateParams', '$rootScope', '$scope', '$timeout', '$location', '$filter', '$interval', 'SearchService', 'DebugLinkService', 'MapPopUpTemplateService', function($stateParams, $rootScope, $scope, $timeout, $location, $filter, $interval, SearchService, DebugLinkService, MapPopUpTemplateService) {

    // Define models here
    var intervals = [];
    var vm = this;

    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.term = '';
    vm.pool = [];
    vm.statuses = [];
    
    $rootScope.root.globalFilter = '';
    

    /*
     * Infinity scroll directive's trigger
     * trigger arg: @amount
     * An @amount of statuses will be concatenated to the current result
     * If the pool of statuses's level is low, get more statuses
     * Is also used to init the shown result
    */
    $scope.loadMore = function(amount) {
        if (vm.pool.length < (2 * amount + 1)) {
            getMoreStatuses();
        }
        vm.statuses = vm.statuses.concat(vm.pool.slice(0,amount));
        vm.pool = vm.pool.splice(amount);
    };

    var getMoreStatuses = function() {
        if (vm.pool.length > 0) { 
            // Get new time span bound from the lastest status
            var currentUntilBound = new Date(vm.pool[vm.pool.length -1 ].created_at)
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
    };

    
    /*
     * Wrapper for SearchService
     * Included updating path operation before search
     * Init result with 20 statuses
     * Init a background interval to update the result
     */
    vm.update = function(term) {
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
        $rootScope.root.globalFilter = 'accounts';
        vm.newStasuses = [];
        vm.accounts = [];
        var term = vm.term;

        SearchService.getData(term).then(function(data) {
            data.statuses.forEach(function(ele) {
                var notYetInAccounts = true;
                vm.accounts.forEach(function(account) {
                    if (account.screen_name === ele.screen_name) {
                        notYetInAccounts = false;
                        return notYetInAccounts;
                    }
                });
                if (notYetInAccounts) { vm.accounts.push(ele);}
            });
            vm.peopleSearch = true;
            vm.showMap = false;
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
        vm.newStasuses = [];
        $rootScope.root.globalFilter = "map";
        vm.statuses = [];
        vm.accounts = [];
        vm.showMap = true;
        var initialBound = "/location=-282.65625,-77.54209596075546,307.96875,86.40197606876063";

        updatePath(vm.term + '+' + '/map');

        var params = {
            q: vm.term + "+" + initialBound,
            count: 300
        };
        SearchService.initData(params).then(function(data) {
            var withoutLocation = [];
            data.statuses.forEach(function(ele, index) {
                if (!ele.location_mark) {
                    withoutLocation.push(data.statuses.splice(index, 1)[0]);
                }
            })
            initMap(data.statuses);   
            addUserLocation(withoutLocation);
        }, function() {});

        angular.forEach(intervals, function(interval) {
            $interval.cancel(interval);
        });
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


    // Concat new status with vm.statuses when e.g. ng-click
    vm.showNewStatuses = function() {
        vm.statuses = vm.newStasuses.concat(vm.statuses);
        vm.newStasuses = [];
    };


    // HELPERS FN
    ///////////////////
    var bgUpdateTemp = function() {
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
        intervals.push($interval(bgUpdateTemp, parseInt(period)));
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
        q: query
      });
      $rootScope.root.globalSearchTerm = vm.term;
    }

    // Evaluate current search query to extract term & filter
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

    // Turn filter parameter to the right query parameter
    function filterToQuery(filterName) {
        var filtersToQueries = {
            'photos' : '/image',
            'videos' :'/video',
            'accounts' : '/accounts', 
            'news' : '/news',
            'map' : '/map'
        };
        return filtersToQueries[filterName
        ];
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

    // Init map point from data
    function initMapPoints(data) {
        var tweets = {
            "type": "FeatureCollection",
            "features": [
            ]
        };
        data.forEach(function(ele) {
            if (ele.location_mark && ele.user) {
                var text = MapPopUpTemplateService.genStaticTwitterStatus(ele);
                var pointObject = {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            ele.location_mark[0],
                            ele.location_mark[1]
                        ]
                    },
                    "type": "Feature",
                    "properties": {
                        "popupContent": "<div class='foobar'>" + text + "</div>"
                    },
                    "id": ele.id_str
                };
                tweets.features.push(pointObject);
            }
        });

        return tweets;
    }

    // Get location in search term, from lat, long bound
    function getLocationTermFromBound(bound) {
        var longWest = parseFloat(bound._southWest.lng);
        var latSouth = parseFloat(bound._southWest.lat);
        var longEast = parseFloat(bound._northEast.lng);
        var latNorth = parseFloat(bound._northEast.lat);
        var locationTerm = "/location=" + longWest + "," + latSouth + "," + longEast + "," + latNorth;
        return locationTerm;
    }

     // Get more data on new bounds
    function getMoreLocationOnAction() {
        var bound = map.getBounds();
        var locationTerm = getLocationTermFromBound(bound);
        var params = {
            q: vm.term + "+" + locationTerm,
            count: 300
        };
        SearchService.initData(params).then(function(data) {
            addPointsToMap(window.map, initMapPoints(data.statuses));    
        }, function(data) {});
    }

    // Add more point after getting user info for statuses without location
    function addUserLocation(noLocationStatuses) {
        noLocationStatuses.forEach(function(ele, index) {
            if (ele.user) {
                SearchService.getUserInfo(ele.user.screen_name).then(function(userInfo) {
                    if (userInfo.user && userInfo.user.location_mark) {
                        ele.location_mark = userInfo.user.location_mark;    
                    }

                    if (index === noLocationStatuses.length - 1) {
                        // After getting the last one's userinfo, start adding points to map
                        addPointsToMap(window.map, initMapPoints(noLocationStatuses));    
                    }
                }, function() {});
            }
        });
    }

    // Action related timestamp, used to prevent event bubbling
    var prevZoomAction, prevPanAction, newZoomAction, newPanAction;

    // Add points to map
    function addPointsToMap(map, tweets) {
        function onEachFeature(feature, layer) {
            var popupContent;
            
            if (feature.properties && feature.properties.popupContent) {
                popupContent = feature.properties.popupContent;
            }

            layer.bindPopup(popupContent);
        }
        L.geoJson([tweets], {
            style: function (feature) {
                return feature.properties && feature.properties.style;
            },
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        }).addTo(map);    
     
        map.on("zoomend", function(event) {
            if (!prevZoomAction) {
                prevZoomAction = new Date();
                getMoreLocationOnAction();
            } else {
                newZoomAction = new Date();
                var interval = (newZoomAction - prevZoomAction);
                if (interval > 1000) {
                    getMoreLocationOnAction();
                    prevZoomAction = newZoomAction;        
                }
            }
            
        });
        map.on("dragend", function(event) {
            if (!prevPanAction) {
                prevPanAction = new Date();
                getMoreLocationOnAction();
            } else {
                newPanAction = new Date();
                var interval = (newPanAction - prevPanAction);
                if (interval > 1000) {
                    getMoreLocationOnAction();
                    prevPanAction = newPanAction;        
                }
            }
        });
        
    }
    // Init map
    function initMap(data) {
        window.map = L.map('search-map').setView(new L.LatLng(5.3,-4.9), 2);
        var tweets = initMapPoints(data);

        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        }).addTo(window.map);

        addPointsToMap(window.map, tweets);
    }

    ////////////
    // MANAGING STATE CHANGES RESULTING IN SEARCH
    ///////////

    // On search term change, based a a clicked on a hashtag
        $scope.$watch(function() {
            return $location.search();
        }, function(value, Oldvalue) {
            // When changing search term through clicking on a statues
            if (value.q && value.q.indexOf("id") > -1) {
                return 1; // Leave this for single-tweet view
            }
            if (value.q.split("+")[0] !== vm.term) {
                evalSearchQuery();
                var filterFn = 'filter' + $filter('capitalize')($rootScope.root.globalFilter);
                vm[filterFn]();   
                vm.showResult = true;
            }
            // Rare case: when click on map tweet, but search term stay the same
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