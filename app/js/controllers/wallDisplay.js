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
    var tweetTimeout, cycleInterval, leaderboardInterval;

    function calculateTerm(argument) {
        term = "";

        var i;
        for (i = 0; i < vm.wallOptions.all.length; i++) {
            term = term + ' ' + vm.wallOptions.all[i].text;
        }

        for (i = 0; i < vm.wallOptions.none.length; i++) {
            term = term + ' -' + vm.wallOptions.none[i].text;
        }

        if (vm.wallOptions.any.length > 0) {
            term = term + ' ' + vm.wallOptions.any[0].text;
            for (i = 1; i < vm.wallOptions.any.length; i++) {
                term = term + ' OR ' + vm.wallOptions.any[i].text;
            }
        }
        if (vm.wallOptions.mainHashtag) {
            if (term) {
                term = term + ' OR ' + vm.wallOptions.mainHashtag;
            } else {
                term = vm.wallOptions.mainHashtag;
            }
        }

        if (vm.wallOptions.layoutStyle === '4') {
            if (term === "") {
                term = "/location";
            } else {
                term = term + " /location";
            }
        }

        if (vm.wallOptions.images) {
            if (vm.wallOptions.images === "only") {
                term = term + ' /image';
            } else if (vm.wallOptions.images === "none") {
                term = term + ' -/image';
            }
        }

        if (vm.wallOptions.videos) {
            if (vm.wallOptions.videos === "only") {
                term = term + ' /video';
            } else if (vm.wallOptions.videos === "none") {
                term = term + ' -/video';
            }
        }

        if (vm.wallOptions.audio) {
            if (vm.wallOptions.audio === "only") {
                term = term + ' /audio';
            } else if (vm.wallOptions.audio === "none") {
                term = term + ' -/audio';
            }
        }

        if (vm.wallOptions.profanity) {
            if (vm.wallOptions.profanity === true) {
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
        if (term.substring(0, 2) === 'OR') {
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
                if (vm.wallOptions.layoutStyle === 1) {
                    maxStatusCount = 10; //linear
                } else if (vm.wallOptions.layoutStyle === 2) {
                    maxStatusCount = 20; //masonry
                } else if (vm.wallOptions.layoutStyle === 3) {
                    maxStatusCount = 1; //single
                } else if (vm.wallOptions.layoutStyle === 4) {
                    maxStatusCount = 10; //map
                }
                calculateTerm();
                //On INIT
                tweetTimeout = vm.update2(0);
                vm.loadLeaderboard();
                cycleInterval = vm.cycleTweets();
                leaderboardInterval = vm.cycleLeaderboard();

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
        return vm.wallOptions.headerPosition === 'Bottom' ? 'row wall-header wall-footer' : 'row wall-header';
    };

    $scope.stopLeaderboardTimer = function() {
        $interval.cancel(leaderboardInterval);
        leaderboardInterval = undefined;
    };

    $scope.startLeaderboardTimer = function() {
        leaderboardInterval = vm.cycleLeaderboard();
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

    function contains(Statuses, status) {
        for (var i = 0; i < Statuses.length; i++) {
            if (Statuses[i].id_str === status.id_str) {
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

    function removeLeastRecentTweet() {
        var minIndex = 0;
        for (var i = 0; i < vm.statuses.length; i++) {
            if (vm.statuses[i].created_at < vm.statuses[minIndex]) {
                minIndex = i;
            }
        }
        vm.statuses.splice(minIndex, 1);
    }

    vm.update2 = function(refreshTime) {
        return $timeout(function() {
            SearchService.initData(searchParams).then(function(data) {
                if (data.statuses) {
                    if (data.statuses.length <= 0) {
                        vm.showEmpty = true;
                        tweetTimeout = vm.update2(refreshTime + 10000);
                        console.log(refreshTime + 10000);
                    } else {
                        if (vm.statuses.length <= 0) {
                            vm.statuses = data.statuses.splice(0, searchParams.count);
                        } else {
                            for (var i = data.statuses.length - 1; i > -1; i--) {
                                if (vm.wallOptions.cycle) {
                                    if (!contains(vm.statuses, data.statuses[i])) {
                                        console.log("triggered");
                                        removeLeastRecentTweet();
                                        $interval.cancel(cycleInterval);
                                        cycleInterval = undefined;
                                        vm.statuses.unshift(data.statuses[i]);
                                        cycleInterval = vm.cycleTweets();

                                    }
                                } else {
                                    if (data.statuses[i].created_at > vm.statuses[0].created_at) {
                                        vm.statuses.unshift(data.statuses[i]);
                                        vm.statuses.pop();
                                    }
                                }
                            }
                        }
                        var newRefreshTime = getRefreshTime(data.search_metadata.period);
                        tweetTimeout = vm.update2(newRefreshTime);
                        vm.showEmpty = false;
                    }
                } else {
                    tweetTimeout = vm.update2(refreshTime + 10000);
                    console.log(refreshTime + 10000);
                }
            }, function(error) {
                tweetTimeout = vm.update2(refreshTime + 10000);
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

    function groupByMonths(statistics) {
        var date = {};

        for (var property in statistics.created_at) {
            var d = new Date(property);
            var prop = d.toLocaleString("en-us", { month: "long" }) + "-" + d.getFullYear();
            
            if(date[prop]) {
                date[prop] = date[prop] + statistics.created_at[property];
            }
            else {
                date[prop] = statistics.created_at[property];
            }
        }   

        statistics.created_month = date;
    }

    function evalHistogram(statistics) {
        if (Object.getOwnPropertyNames(statistics.created_at).length !== 0) {
            var data = [];
            var labels = [];
            var chosen_attr = statistics.created_at;

            groupByMonths(statistics);

            // If number of months increases 2 then show month wise histogram
            if (Object.keys(statistics.created_month).length > 2) {
                chosen_attr = statistics.created_month;
            }

            for (var property in chosen_attr) {
                if (chosen_attr.hasOwnProperty(property)) {
                    labels.push(property);
                    data.push(chosen_attr[property]);
                }
            }
            var bins = calculateBins(labels, data);
            data = bins.data;
            labels = bins.labels;
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
            for (s in statistics.hashtags) {
                sortable.push([s, statistics.hashtags[s]]);
            }
            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });
            sortable = (sortable.slice(0, 10));
            vm.topHashtagsData = sortable;

            //Top Mentions
            sortable = [];
            for (s in statistics.mentions) {
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

    vm.loadLeaderboard = function () {
        if (vm.wallOptions.showStatistics === true) {
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
            return $interval(function() {
                if (vm.statuses.length > 0) {
                    var tempTweet = vm.statuses.pop();
                    vm.statuses.unshift(tempTweet);
                }
            }, vm.wallOptions.cycleDelayTime*1000);
        } else {
            return;
        }
    };

    vm.cycleLeaderboard = function() {
        if (vm.wallOptions.showStatistics === true) {
            return $interval(function() {
                var tabs = $('.nav-tabs-custom > .nav-tabs > li'),
                    active = tabs.filter('.active'),
                    next = active.next('li'),
                    toClick = next.length ? next.find('a') : tabs.eq(0).find('a');
                toClick.trigger('click');
            }, 5000);
        } else {
            return;
        }
    };

    $scope.$on('$destroy', function() {
        if (tweetTimeout) {
            $timeout.cancel(tweetTimeout);
        }
        if (cycleInterval) {
            $interval.cancel(cycleInterval);
        }
        if (leaderboardInterval) {
            $interval.cancel(leaderboardInterval);
        }
    });

}

controllersModule.controller('WallDisplay', ['$scope', '$stateParams', '$interval', '$timeout', '$location', '$http', '$window', '$resource', 'AppSettings', 'SearchService', 'StatisticsService', 'AppsService', 'Fullscreen', WallDisplay]);
