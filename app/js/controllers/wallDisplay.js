'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallDisplay($scope, $stateParams, $interval, $timeout, $location, $http, $window, AppSettings, SearchService, StatisticsService, Fullscreen) {

    var vm, flag, allStatuses, nextStatuses, term, count, searchParams;
    vm = this;
    //var ongoingRequest = false;
    null;
    vm.wallOptions = JSON.parse(decodeURI($location.search().data));
    //$scope.newWallOptions = vm.wallOptions;
    var init = function() {
        flag = false;
        vm.showEmpty = false;
        allStatuses = [];
        nextStatuses = [];
        vm.statuses = [];
        searchParams = {};
        vm.displaySearch = true;

    }
    var maxStatusCount = 0;
    if (vm.wallOptions.layoutStyle == '1')
        maxStatusCount = 3; //linear
    else if (vm.wallOptions.layoutStyle == '2')
        maxStatusCount = 9; //masonry
    else if (vm.wallOptions.layoutStyle == '3')
        maxStatusCount = 1; //single
    count = 0;
    init();
    //calculate term
    function calculateTerm(argument) {
        term = vm.wallOptions.mainHashtag;
        for (var i = 0; i < vm.wallOptions.allWords.length; i++) {
            term = term + ' ' + vm.wallOptions.allWords[i].text;
        };
        for (var i = 0; i < vm.wallOptions.anyWords.length; i++) {
            term = term + ' ' + vm.wallOptions.anyWords[i].text;
        };
        for (var i = 0; i < vm.wallOptions.noWords.length; i++) {
            term = term + ' -' + vm.wallOptions.noWords[i].text;
        };
        for (var i = 0; i < vm.wallOptions.allHashtags.length; i++) {
            term = term + ' #' + vm.wallOptions.allHashtags[i].text;
        };
        for (var i = 0; i < vm.wallOptions.from.length; i++) {
            term = term + ' from:' + vm.wallOptions.from[i].text;
        };
        for (var i = 0; i < vm.wallOptions.to.length; i++) {
            term = term + ' @' + vm.wallOptions.to[i].text;
        };
        for (var i = 0; i < vm.wallOptions.mentioning.length; i++) {
            term = term + ' @' + vm.wallOptions.mentioning[i].text;
        };
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
        if (vm.wallOptions.sinceDate) {
            term = term + ' since:' + moment(vm.wallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }
        if (vm.wallOptions.untilDate) {
            term = term + ' until:' + moment(vm.wallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }

        searchParams.q = term;
        searchParams.count = maxStatusCount;
    }

    calculateTerm();


    vm.histogramOptions = {
        //scaleBeginAtZero: true
        responsive: true
    };
    vm.topHashTagsOptions = {

    };
    vm.topTwitterersOptions = {

    };
    vm.topMentionsOptions = {

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
            if (Statuses[i] === status_id) {
                return true;
            }
        };
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

    vm.update2 = function(refreshTime, currCount) {
        if (currCount == count) {
            return $timeout(function() {

                SearchService.initData(searchParams).then(function(data) {
                    if (data.statuses) {
                        if (data.statuses.length <= 0) {
                            vm.showEmpty = true;
                        } else {
                            if (vm.statuses.length <= 0) {
                                vm.statuses = data.statuses.splice(0, maxStatusCount);
                                nextStatuses = vm.statuses;
                            } else {
                                for (var i = data.statuses.length - 1; i > -1; i--) {
                                    if (data.statuses[i].created_at > vm.statuses[0].created_at) {
                                        vm.statuses.unshift(data.statuses[i]);
                                        vm.statuses.pop();
                                    }
                                }
                            }
                            var newRefreshTime = getRefreshTime(data.search_metadata.period);
                            vm.update2(newRefreshTime, currCount);
                            vm.showEmpty = false;

                        }
                    } else {}

                }, function(error) {

                });
            }, refreshTime);
        } else {

            vm.statuses = [];
            return null;
        }

    };

    var tweetRefreshTime = 4000;

    vm.fullscreenEnabled = false;
    $scope.fullscreen = function() {
        if (Fullscreen.isEnabled()) {
            Fullscreen.cancel();
            vm.fullscreenEnabled = false;
        } else {
            Fullscreen.all();
            vm.fullscreenEnabled = true;
        }
    };

    Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled) {
        vm.fullscreenEnabled = isFullscreenEnabled;
    });

    //On INIT
    vm.update2(0, count);
    //code for modal
    function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        //Selects foreground colour as black or white based on background
    function colourCalculator(rgb) {
        var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) / 1000);
        if (o > 125) {
            return '#000000';
        } else {
            return '#FFFFFF';
        }
    }

    // $scope.$watch('newWallOptions.headerColour', function() {
    //     if ($scope.newWallOptions.headerColour)
    //         $scope.newWallOptions.headerForeColour = colourCalculator(hexToRgb($scope.newWallOptions.headerColour));
    // });

    // $scope.$watch('newWallOptions.mainHashtagText', function() {
    //     if ($scope.newWallOptions.mainHashtagText)
    //         if ($scope.newWallOptions.mainHashtagText.length !== 0) {
    //             if ($scope.newWallOptions.mainHashtagText[0] != '#') {
    //                 $scope.newWallOptions.mainHashtag = '#' + $scope.newWallOptions.mainHashtagText;
    //             } else {
    //                 $scope.newWallOptions.mainHashtag = $scope.newWallOptions.mainHashtagText;
    //             }
    //         }
    // });

    $scope.proceed = function() {
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //construct term
        var newTerm = $scope.newWallOptions.mainHashtag;
        for (var i = 0; i < $scope.newWallOptions.allWords.length; i++) {
            newTerm = newTerm + ' ' + $scope.newWallOptions.allWords[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.anyWords.length; i++) {
            newTerm = newTerm + ' ' + $scope.newWallOptions.anyWords[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.noWords.length; i++) {
            newTerm = newTerm + ' -' + $scope.newWallOptions.noWords[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.allHashtags.length; i++) {
            newTerm = newTerm + ' #' + $scope.newWallOptions.allHashtags[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.from.length; i++) {
            newTerm = newTerm + ' from:' + $scope.newWallOptions.from[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.to.length; i++) {
            newTerm = newTerm + ' @' + $scope.newWallOptions.to[i].text;
        }
        for (var i = 0; i < $scope.newWallOptions.mentioning.length; i++) {
            newTerm = newTerm + ' @' + $scope.newWallOptions.mentioning[i].text;
        }
        if ($scope.newWallOptions.images) {
            if ($scope.newWallOptions.images == "only") {
                newTerm = newTerm + ' /image';
            } else if ($scope.newWallOptions.images == "none") {
                newTerm = newTerm + ' -/image';
            }
        }
        if ($scope.newWallOptions.videos) {
            if ($scope.newWallOptions.videos == "only") {
                newTerm = newTerm + ' /video';
            } else if ($scope.newWallOptions.videos == "none") {
                newTerm = newTerm + ' -/video';
            }
        }
        if ($scope.newWallOptions.audio) {
            if ($scope.newWallOptions.audio == "only") {
                newTerm = newTerm + ' /audio';
            } else if ($scope.newWallOptions.audio == "none") {
                newTerm = newTerm + ' -/audio';
            }
        }
        if ($scope.newWallOptions.sinceDate) {
            newTerm = newTerm + ' since:' + moment($scope.newWallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }
        if ($scope.newWallOptions.untilDate) {
            newTerm = newTerm + ' until:' + moment($scope.newWallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }
        $scope.newWallOptions.term = newTerm;
        $('#wall-modal').modal('toggle');
        $("#wall-modal").on('hidden.bs.modal', function() {
            if (flag == true) {
                //count++;
                init();
                //vm.wallOptions = $scope.newWallOptions;
                term = newTerm;
                $location.path('/wall/display').search($scope.newWallOptions);
                vm.update2(0, count);
            }
        });
        flag = true;
    };


    $scope.resetDate = function() {
        $scope.newWallOptions.sinceDate = null;
        $scope.newWallOptions.untilDate = null;
    };

    //Statistics Code

    var randomColorGenerator = function() {
        return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
    };

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
            labels = labels.slice(labels.length - 25, labels.length);
            data = data.slice(data.length - 25, data.length);
            vm.histogram2 = [];
            vm.histogram2.push(data);
            vm.labels = labels;
            data = [];
            labels = [];
            for (var property in statistics.hashtags) {
                if (statistics.hashtags.hasOwnProperty(property)) {
                    if (statistics.hashtags[property] > 1) {
                        labels.push('#' + property);
                        data.push(statistics.hashtags[property]);
                    }
                }
            }
            //vm.topHashtagsData = [];
            vm.topHashtagsData = data;
            vm.topHashtagsLabels = labels;
            data = [];
            labels = [];
            for (var property in statistics.screen_name) {
                if (statistics.screen_name.hasOwnProperty(property)) {
                    if (statistics.screen_name[property] > 1) {
                        labels.push('@' + property);
                        data.push(statistics.screen_name[property]);
                    }
                }
            }
            //vm.topHashtagsData = [];
            vm.topTwitterersData = data;
            vm.topTwitterersLabels = labels;
            data = [];
            labels = [];
            for (var property in statistics.mentions) {
                if (statistics.mentions.hasOwnProperty(property)) {
                    if (statistics.mentions[property] > 1) {
                        labels.push('@' + property);
                        data.push(statistics.mentions[property]);
                    }
                }
            }
            //vm.topHashtagsData = [];
            vm.topMentionsData = data;
            vm.topMentionsLabels = labels;
        } else {
            //vm.histogram2 = [];
        }
    }

    $interval(function() {
        if (vm.statuses.length > 0) {
            var statParams = searchParams;
            StatisticsService.getStatistics(statParams)
                .then(function(statistics) {
                        evalHistogram(statistics);
                    },
                    function() {}
                );
        }
    }, 10000);


}

controllersModule.controller('WallDisplay', ['$scope', '$stateParams', '$interval', '$timeout', '$location', '$http', '$window', 'AppSettings', 'SearchService', 'StatisticsService', 'Fullscreen', WallDisplay]);
