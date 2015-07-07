'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
/**
 * @ngInject
 */

controllersModule.controller('SearchCtrl', ['$stateParams', '$rootScope', '$scope', '$timeout', '$location', '$filter', '$interval', 'SearchService', 'DebugLinkService', 'MapPopUpTemplateService', function($stateParams, $rootScope, $scope, $timeout, $location, $filter, $interval, SearchService, DebugLinkService, MapPopUpTemplateService) {

    // Define models here
    var vm = this;
    window.vm = vm;
    vm.modal = { text: "Tweet content placeholder"};
    vm.showDetail = false;
    vm.showResult = false;
    vm.term = '';
    vm.currentFilter = '';
    var intervals = [];

    // Infinite-scroll trigger 
    var getMore = function() {
        var untilDate = new Date((new Date(vm.pool[vm.pool.length -1 ].created_at)).getTime() - 1);
        var untilDateTerm = $filter("date")(untilDate, "yyyy-MM-dd_HH:mm");
        var loadPoolTerm = $location.search().q + "+until:" + untilDateTerm;
        var params = {
           q: loadPoolTerm,
           timezoneOffset: (new Date().getTimezoneOffset())
        };
        SearchService.getData(params).then(function(data) {
               vm.pool = vm.pool.concat(data.statuses);
        }, function() {});
    };
    $scope.loadMore = function(step) {
        if (vm.pool.length < (2 * step + 1)) {
            getMore();
        }
        vm.statuses = vm.statuses.concat(vm.pool.slice(0,step));
        vm.pool = vm.pool.splice(step);
        console.log(vm.statuses.length);
    };



    // Update status and path on successful search
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
    
    // No filter search
    vm.filterLive = function() {
        vm.newStasuses = [];
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.currentFilter = 'live';
        var term = vm.term;
        vm.update(term);
    };

    // Accounts search
    // Do a normal query, go one by one, check if existed in accounts to add to vm.accounts
    vm.filterAccounts = function() {
        vm.newStasuses = [];
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
            vm.peopleSearch = true;
            vm.showMap = false;
        }, function() {});

        updatePath(vm.term + '+' + '/accounts');
    };

    // Photos search
    vm.filterPhotos = function() {
        vm.newStasuses = [];
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.currentFilter = 'photos';
        var term = vm.term + '+' + '/image';
        vm.update(term);
    };

    // Videos search
    vm.filterVideos = function() {
        vm.newStasuses = [];
        vm.peopleSearch = false;
        vm.showMap = false;
        vm.statuses = [];   
        vm.currentFilter = 'videos';
        vm.showResult = true;


        // Get native videos
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


    // News search
    vm.filterNews = function() {
        vm.newStasuses = [];
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
        vm.newStasuses = [];
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
                 console.log(vm.newStasuses);
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
        console.log(period);
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


    // Init map point from data
    function initMapPoints(data) {
        var tweets = {
            "type": "FeatureCollection",
            "features": [
            ]
        };
        data.forEach(function(ele) {
            if (ele.location_mark) {
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

    // Add points to map
    function addPointsToMap(map, tweets) {
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
     
        map.on("zoomend", function(event) {
            var bound = map.getBounds();
            var longWest = parseFloat(bound._southWest.lng);
            var latSouth = parseFloat(bound._southWest.lat);
            var longEast = parseFloat(bound._northEast.lng);
            var latNorth = parseFloat(bound._northEast.lat);
            var locationTerm = "/location=" + longWest + "," + latSouth + "," + longEast + "," + latNorth; 
            console.log(vm.term + "+" + locationTerm);
            SearchService.getData(vm.term + "+" + locationTerm).then(function(data) {
                console.log(data);
                addPointsToMap(window.map, initMapPoints(data.statuses));    
            }, function(data) {});
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
    }, function(value, Oldvalue) {
        // When changing search term through clicking on a statues
        if (value.q.split("+")[0] !== vm.term) {
            evalSearchQuery();
            var filterFn = 'filter' + $filter('capitalize')(vm.currentFilter);
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