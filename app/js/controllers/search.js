'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$stateParams', '$rootScope', '$scope', '$timeout', '$location', '$filter', '$interval', 'SearchService', 'DebugLinkService', function($stateParams, $rootScope, $scope, $timeout, $location, $filter, $interval, SearchService, DebugLinkService) {

    // Define models here
    var vm = this;
    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.term = '';
    vm.currentFilter = '';
    var intervals = [];
        

    // Update status and path on successful search
    vm.update = function(term) {
        updatePath(term);
        SearchService.getData(term).then(function(data) {
               vm.statuses = data.statuses;
               vm.showResult = true;
               startNewInterval(data.search_metadata.period);
        }, function() {});

        
    };
    
    // No filter search
    vm.filterLive = function() {
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.currentFilter = 'live';
        var term = vm.term;
        vm.update(term);
    };

    // Accounts search
    // Do a normal query, go one by one, check if existed in accounts to add to vm.accounts
    vm.filterAccounts = function() {
        vm.peopleSearch = true;
        vm.showMap = false;
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
                });
                if (notYetInAccounts) { vm.accounts.push(ele);}
            });
        }, function() {});

        updatePath(vm.term + '+' + '/accounts');
    };

    // Photos search
    vm.filterPhotos = function() {
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.currentFilter = 'photos';
        var term = vm.term + '+' + '/image';
        vm.update(term);
    };

    // Videos search
    vm.filterVideos = function() {
        vm.peopleSearch = false;
        vm.showMap = false;
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
            startNewInterval(data.search_metadata.period);
        }, function() {});    

        updatePath(vm.term + '+' + '/video');
    };


    // News search
    vm.filterNews = function() {
        vm.peopleSearch = false;
        vm.showMap = false;
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
            });
            startNewInterval(data.search_metadata.period);
        }, function() {});

        updatePath(vm.term + '+' + '/news');
    };

    // Map search, show results on a map
    vm.filterMap = function() {
        vm.currentFilter = "map";
        vm.statuses = [];
        vm.accounts = [];
        vm.showMap = true;

        updatePath(vm.term + '+' + '/map');
        var params = {
            q: vm.term,
            count: 300
        };
        SearchService.initData(params).then(function(data) {
            initMap(data.statuses);    
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
        var lastestDateObj = new Date(vm.statuses[0].created_at);
        var term = (vm.currentFilter === 'live') ? vm.term : vm.term + '+' + filterToQuery(vm.currentFilter);
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
      $rootScope.root.globalSearchTerm = $location.search().q;
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
        vm.currentFilter = (queryParts[1]) ? queryToFilter[queryParts[1]] : 'live';

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

    // Init map
    function initMap(data) {
        var map = L.map('search-map').setView(new L.LatLng(5.3,-4.9), 2);
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        }).addTo(map);

        var tweets = {
            "type": "FeatureCollection",
            "features": [
            ]
        };
        data.forEach(function(ele) {
            if (ele.location_point) {
                var text = $filter('tweetHashtag')($filter('tweetMention')(ele.text));
                var pointObject = {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            ele.location_point[0],
                            ele.location_point[1]
                        ]
                    },
                    "type": "Feature",
                    "properties": {
                        "popupContent": text
                    },
                    "id": ele.id_str
                };
                tweets.features.push(pointObject);
            }
        });

        function onEachFeature(feature, layer) {
            
            if (feature.properties && feature.properties.popupContent) {
                var popupContent = feature.properties.popupContent;
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
    };
        

    // Init statuses if path is a search url
    angular.element(document).ready(function() {
        if ($stateParams.q !== undefined) {
            evalSearchQuery();
            var filterFn = 'filter' + $filter('capitalize')(vm.currentFilter);
            vm[filterFn]();   
            vm.showResult = true;
      }
    });

    // On search term change, based a a clicked on a hashtag
    // Compare with old term, then search with no filter
    $scope.$watch(function() {
        return $location.search();
    }, function(value) {
        if (value.q.split("+")[0] !== vm.term) {
            evalSearchQuery();
            var filterFn = 'filter' + $filter('capitalize')(vm.currentFilter);
            vm[filterFn]();   
            vm.showResult = true;
        }
    });

}]);