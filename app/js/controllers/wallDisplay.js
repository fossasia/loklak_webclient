'use strict';
/* global angular */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
var Chart = require('chart.js');
/**
 * @ngInject
 */
function WallDisplay($scope, $stateParams, $interval, $timeout, $location, $http, $window, $resource, AppSettings, SearchService, StatisticsService, AppsService, Fullscreen) {

    var vm, flag, allStatuses, nextStatuses, term, count, searchParams, maxStatusCount;
    vm = this;
    vm.invalidId = false;

    function calculateTerm(argument) {
        term = "";
        if (vm.wallOptions.mainHashtag) {
            term = vm.wallOptions.mainHashtag;
        }
        for (var i = 0; i < vm.wallOptions.all.length; i++) {
            term = term + ' ' + vm.wallOptions.all[i].text;
        };
        for (var i = 0; i < vm.wallOptions.none.length; i++) {
            term = term + ' -' + vm.wallOptions.none[i].text;
        };
        if (vm.wallOptions.any.length > 0) {
            term = term + ' ' + vm.wallOptions.any[0].text;
            for (var i = 1; i < vm.wallOptions.any.length; i++) {
                term = term + ' OR ' + vm.wallOptions.any[i].text;
            };
        }
        if (vm.wallOptions.layoutStyle == '4') {
            if (term == "") {
                term = "/location";
            } else {
                term = term + " /location";
            }
        }
        if (vm.wallOptions.images) {
            if (vm.wallOptions.images == "only") {
                term = term + ' /image';
            } else if (vm.wallOptions.images == "none") {
                term = term + ' -/image';
            }
        }
        if (vm.wallOptions.videos) {
            if (vm.wallOptions.videos == "only") {
                term = term + ' /video';
            } else if (vm.wallOptions.videos == "none") {
                term = term + ' -/video';
            }
        }
        if (vm.wallOptions.audio) {
            if (vm.wallOptions.audio == "only") {
                term = term + ' /audio';
            } else if (vm.wallOptions.audio == "none") {
                term = term + ' -/audio';
            }
        }
        if (vm.wallOptions.profanity) {
            if (vm.wallOptions.profanity == true) {
                term = term + ' -/profanity';
            }
        }
        if (!vm.wallOptions.blockRetweets) {
            term = term + ' include:retweets';
        }
        if (vm.wallOptions.chosenLocation) {
            term = term + ' near:' + vm.wallOptions.chosenLocation;
        }
        if (vm.wallOptions.sinceDate) {
            term = term + ' since:' + moment(vm.wallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }
        if (vm.wallOptions.untilDate) {
            term = term + ' until:' + moment(vm.wallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }
        //clean up
        term = term.trim();
        if (term.substring(0, 2) == 'OR') {
            term = term.substring(2).trim();
        }
        console.log(term);
        searchParams.q = term;
        searchParams.count = maxStatusCount;
        console.log(vm.wallOptions.cyclePostLimit);
        if (vm.wallOptions.cycle) {
            if (vm.wallOptions.cyclePostLimit > searchParams.count) {
                searchParams.count = vm.wallOptions.cyclePostLimit;
            }
        }
        searchParams.fromWall = true;
    }

    function getWallData() {
        vm.wallOptions = AppsService.get({
            user: $stateParams.user,
            app: 'wall',
            id: $stateParams.id
        });
        vm.wallOptions.$promise.then(function(data) {
            if (vm.wallOptions.id) {
                if (vm.wallOptions.layoutStyle == '1') {
                    maxStatusCount = 10; //linear
                } else if (vm.wallOptions.layoutStyle == '2') {
                    maxStatusCount = 20; //masonry
                } else if (vm.wallOptions.layoutStyle == '3') {
                    maxStatusCount = 1; //single
                } else if (vm.wallOptions.layoutStyle == '4') {
                    maxStatusCount = 10; //map
                }
                calculateTerm();
                //On INIT
                vm.update2(0);
                vm.loadLeaderboard();
            } else {
                vm.invalidId = true;
            }

        });
    }

    getWallData();

    var init = function() {
        flag = false;
        vm.showEmpty = false;
        allStatuses = [];
        nextStatuses = [];
        vm.statuses = [];
        searchParams = {};
        vm.displaySearch = true;
    };

    init();

    vm.histogramOptions = {
        //scaleBeginAtZero: true
        responsive: true
    };

    $scope.getHeaderClass = function() {
        return vm.wallOptions.headerPosition == 'Bottom' ? 'row wall-header wall-footer' : 'row wall-header';
    };

    var getRefreshTime = function(period) {
        // if (period < 7000) {
        //     return 3000;
        // }
        // if (period <= 3000) {
        //     return 0.7 * period;
        // }
        // return 5000;
        var wall_min_showtime = 5000;
        var refreshTime = (30000 <= (period >= wall_min_showtime ? period : wall_min_showtime) ? 30000 : (period >= wall_min_showtime ? period : wall_min_showtime));
        console.log("Refresh Time:" + refreshTime);
        return refreshTime;
    };

    /*
     * Create photoswipe
     * Lib's docs: http://photoswipe.com/documentation/getting-started.html
     */
    vm.open = function(status_id) {
        //$interval.cancel(interval);
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
            if (Statuses[i] == status_id) {
                return true;
            }
        }
        return false;
    }

    function compare(a, b) {
        if (a.created_at < b.created_at) {
            return -1;
        } else if (a.created_at > b.created_at) {
            return 1;
        }
        return 0;
    }



    // vm.update = function(refreshTime) {
    //     return $timeout(function() {
    //         SearchService.getData(term).then(function(data) {
    //             if (data.statuses) {
    //                 for (var i = data.statuses.length - 1; i >= 0; i--) {
    //                     if (!contains(allStatuses, data.statuses[i].id_str)) {
    //                         try {
    //                             // var profileURLString = data.statuses[i].user.profile_image_url_https;
    //                             // var splitURL = profileURLString.split('_bigger');
    //                             // data.statuses[i].user.profile_image_url = splitURL[0] + splitURL[1];
    //                             nextStatuses.push(data.statuses[i]);
    //                             allStatuses.push(data.statuses[i].id_str);
    //                         } catch (ex) {

    //                         }

    //                     }
    //                 }
    //             }
    //             nextStatuses.sort(compare);
    //             var newRefreshTime = getRefreshTime(data.search_metadata.period);
    //             vm.update(newRefreshTime);
    //         }, function(error) {

    //         });
    //     }, refreshTime);

    // };

    vm.update2 = function(refreshTime) {
        return $timeout(function() {
            SearchService.initData(searchParams).then(function(data) {
                if (data.statuses) {
                    if (data.statuses.length <= 0) {
                        vm.showEmpty = true;
                        vm.update2(refreshTime + 10000);
                        console.log(refreshTime + 10000);
                    } else {
                        if (vm.statuses.length <= 0) {
                            vm.statuses = data.statuses.splice(0, searchParams.count);
                            nextStatuses = vm.statuses;
                        } else {
                            for (var i = data.statuses.length - 1; i > -1; i--) {
                                if (data.statuses[i].created_at > vm.statuses[0].created_at) {
                                    // $('#wall-tweet-container').find('div').first().addClass('linear-list-animation');
                                    // $timeout(function() {
                                    vm.statuses.unshift(data.statuses[i]);
                                    //$('#wall-tweet-container').find('div').first().removeClass('linear-list-animation');
                                    vm.statuses.pop();
                                    //},200);


                                }
                            }
                        }
                        var newRefreshTime = getRefreshTime(data.search_metadata.period);
                        vm.update2(newRefreshTime);
                        vm.showEmpty = false;
                    }
                } else {
                    vm.update2(refreshTime + 10000);
                    console.log(refreshTime + 10000);
                }
            }, function(error) {
                vm.update2(refreshTime + 10000);
                console.log(refreshTime + 10000);

            });
        }, refreshTime);
    };

    var tweetRefreshTime = 4000;

    vm.fullscreenEnabled = false;
    $scope.fullscreen = function() {
        if (Fullscreen.isEnabled()) {
            Fullscreen.cancel();
        } else {
            Fullscreen.all();
        }
    };

    Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled) {
        vm.fullscreenEnabled = isFullscreenEnabled;
    });



    //Statistics Code

    var randomColorGenerator = function() {
        return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
    };

    function compareP(a, b) {
        if (a.screen_name < b.screen_name) {
            return -1;
        } else if (a.screen_name > b.screen_name) {
            return 1;
        }
        return 0;
    }

    function calculateBins(labels, data) {
        var binCount = 10;
        if (labels.length <= binCount) {
            return ({
                data: data,
                labels: labels
            });
        }
        var intervalLength = Math.round(labels.length / binCount);
        var newData = [],
            newLabels = [];
        for (var i = 0; i < labels.length; i += intervalLength) {
            newLabels.push(labels[i]);
            var sum = 0;
            for (var j = i; j < (i + intervalLength); j++) {
                if (j < data.length) {
                    sum = sum + data[j];
                }
            }
            newData.push(sum);
        }
        var retval = {
            data: newData,
            labels: newLabels
        };
        return retval;
    }

    function evalHistogram(statistics) {
        if (Object.getOwnPropertyNames(statistics.created_at).length !== 0) {
            var data = [];
            var labels = [];

            for (var property in statistics.created_at) {
                if (statistics.created_at.hasOwnProperty(property)) {
                    labels.push(property);
                    data.push(statistics.created_at[property]);
                }
            }
            var bins = calculateBins(labels, data);
            data = bins.data;
            labels = bins.labels;
            //labels = labels.slice(labels.length - 25, labels.length);
            //data = data.slice(data.length - 25, data.length);
            vm.histogram2 = [];
            vm.histogram2.push(data);
            vm.labels = labels;
            var sortable = [];
            data = [];
            labels = [];

            //Top twitterers
            for (var s in statistics.screen_name) {
                sortable.push([s, statistics.screen_name[s]]);
            }

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });
            sortable = (sortable.slice(0, 10));
            vm.topTwitterersData = sortable;

            //Top Hashtags
            sortable = [];
            for (var s in statistics.hashtags) {
                sortable.push([s, statistics.hashtags[s]]);
            }
            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });
            sortable = (sortable.slice(0, 10));
            vm.topHashtagsData = sortable;

            //Top Mentions
            sortable = [];
            for (var s in statistics.mentions) {
                sortable.push([s, statistics.mentions[s]]);
            }

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });
            sortable = (sortable.slice(0, 10));
            vm.topMentionsData = sortable;
        } else {
            //vm.histogram2 = [];
        }
    }

    vm.loadLeaderboard = function() {
        if (vm.wallOptions.showStatistics == true) {
            //if (vm.statuses.length > 0) {
            var statParams = searchParams;
            StatisticsService.getStatistics(statParams)
                .then(function(statistics) {
                        evalHistogram(statistics);
                    },
                    function() {}
                );
            //}
        }
    };

    $interval(function() {
        vm.loadLeaderboard();
    }, 20000);

    vm.cycleTweets = function() {
        if (vm.wallOptions.cycle) {
            if (vm.statuses.length > 0) {
                var tempTweet = vm.statuses.pop();
                // $('#wall-tweet-container').find('div').first().addClass('linear-list-animation');
                // $timeout(function() {
                vm.statuses.unshift(tempTweet);
                //     $('#wall-tweet-container').find('div').first().removeClass('linear-list-animation');

                // }, 200);

            }

        }
    };

    // $scope.$watchCollection("wall.statuses", function() {

    // });

    $interval(function() {
        vm.cycleTweets();
    }, 5000)


}

controllersModule.controller('WallDisplay', ['$scope', '$stateParams', '$interval', '$timeout', '$location', '$http', '$window', '$resource', 'AppSettings', 'SearchService', 'StatisticsService', 'AppsService', 'Fullscreen', WallDisplay]);
