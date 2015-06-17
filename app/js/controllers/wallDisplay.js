'use strict';
/* global angular */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallDisplay($scope, $stateParams, $interval, $timeout, $location, $http, $window, AppSettings, SearchService, Fullscreen) {

    var vm, flag, allStatuses, nextStatuses, term, count;
    vm = this;
    var caller = null;
    var init = function () {
        flag = false;
        vm.showEmpty = false;
        allStatuses = [];
        nextStatuses = [];
        vm.statuses = [];
        vm.displaySearch = true;
        vm.wallOptions = $location.search();
        term = vm.wallOptions.term;
        $timeout.cancel(caller);
    }  
    count = 0;
    init();
    $scope.wallOptions = vm.wallOptions;    

    $scope.getHeaderClass = function() {
        return vm.wallOptions.headerPosition == 'Bottom' ? 'row wall-header wall-footer' : 'row wall-header';
    };

    var maxStatusCount = 0;
    if (vm.wallOptions.layoutStyle == 1)
        maxStatusCount = 3; //linear
    else if (vm.wallOptions.layoutStyle == 2)
        maxStatusCount = 10; //masonry
    else if (vm.wallOptions.layoutStyle == 3)
        maxStatusCount = 1; //single

    var getRefreshTime = function(period) {
        if (period < 7000) {
            return 3000;
        }
        if (period <= 3000) {
            return 0.7 * period;
        }
        return 5000;
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
            if (Statuses[i] === status_id)
                return true;
        }
        return false;
    }

    function compare(a, b) {
        if (a.created_at < b.created_at)
            return -1;
        else if (a.created_at > b.created_at)
            return 1;
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
        console.log(currCount + ":" + count);
        if(currCount==count)
        {
            return $timeout(function() {
                console.log(term);
                SearchService.getData(term).then(function(data) {
                    if (data.statuses) {
                        if (data.statuses.length <= 0) {
                            vm.showEmpty = true;
                        } else {
                            if (vm.statuses.length <= 0) {
                                vm.statuses = data.statuses.splice(0, 3);
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
                            caller = vm.update2(newRefreshTime, currCount);
                            vm.showEmpty = false;
                        }
                    } else {}

                }, function(error) {

                });
            }, refreshTime);
        }
        else {
            $timeout.cancel(caller);
            vm.statuses = [];
            return null;
        }
        
    };

    var tweetRefreshTime = 4000;

    $scope.fullscreen = function() {
        if (Fullscreen.isEnabled())
            Fullscreen.cancel();
        else
            Fullscreen.all();
    };

    //On INIT
    caller = vm.update2(0, count);
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

    $scope.$watch('wallOptions.headerColour', function() {
        if ($scope.wallOptions.headerColour)
            $scope.wallOptions.headerForeColour = colourCalculator(hexToRgb($scope.wallOptions.headerColour));
    });

    $scope.$watch('wallOptions.mainHashtagText', function() {
        if ($scope.wallOptions.mainHashtagText)
            if ($scope.wallOptions.mainHashtagText.length !== 0) {
                if ($scope.wallOptions.mainHashtagText[0] != '#') {
                    $scope.wallOptions.mainHashtag = '#' + $scope.wallOptions.mainHashtagText;
                } else {
                    $scope.wallOptions.mainHashtag = $scope.wallOptions.mainHashtagText;
                }
            }
    });

    $scope.proceed = function() {
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //construct term
        var newTerm = $scope.wallOptions.mainHashtag;
        for (var i = 0; i < $scope.wallOptions.allWords.length; i++) {
            newTerm = newTerm + ' ' + $scope.wallOptions.allWords[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.anyWords.length; i++) {
            newTerm = newTerm + ' ' + $scope.wallOptions.anyWords[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.noWords.length; i++) {
            newTerm = newTerm + ' -' + $scope.wallOptions.noWords[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.allHashtags.length; i++) {
            newTerm = newTerm + ' #' + $scope.wallOptions.allHashtags[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.from.length; i++) {
            newTerm = newTerm + ' from:' + $scope.wallOptions.from[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.to.length; i++) {
            newTerm = newTerm + ' @' + $scope.wallOptions.to[i].text;
        }
        for (var i = 0; i < $scope.wallOptions.mentioning.length; i++) {
            newTerm = newTerm + ' @' + $scope.wallOptions.mentioning[i].text;
        }
        if ($scope.wallOptions.images) {
            if ($scope.wallOptions.images == "only") {
                newTerm = newTerm + ' /image';
            } else if ($scope.wallOptions.images == "none") {
                newTerm = newTerm + ' -/image';
            }
        }
        if ($scope.wallOptions.videos) {
            if ($scope.wallOptions.videos == "only") {
                newTerm = newTerm + ' /video';
            } else if ($scope.wallOptions.videos == "none") {
                newTerm = newTerm + ' -/video';
            }
        }
        if ($scope.wallOptions.audio) {
            if ($scope.wallOptions.audio == "only") {
                newTerm = newTerm + ' /audio';
            } else if ($scope.wallOptions.audio == "none") {
                newTerm = newTerm + ' -/audio';
            }
        }
        if ($scope.wallOptions.sinceDate) {
            newTerm = newTerm + ' since:' + moment($scope.wallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }
        if ($scope.wallOptions.untilDate) {
            newTerm = newTerm + ' until:' + moment($scope.wallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }
        $scope.wallOptions.term = newTerm;
        $('#wall-modal').modal('toggle');
        $("#wall-modal").on('hidden.bs.modal', function() {
            if (flag == true) {
                count++;
                console.log(count);
                init();
                console.log(vm.statuses.length);
                vm.wallOptions = $scope.wallOptions;
                term = newTerm;
                $location.path('/wall/display').search($scope.wallOptions);
                caller = vm.update2(0, count);
            }
        });
        flag = true;
    };


    $scope.resetDate = function() {
        $scope.wallOptions.sinceDate = null;
        $scope.wallOptions.untilDate = null;
    };

}

controllersModule.controller('WallDisplay', ['$scope', '$stateParams', '$interval', '$timeout', '$location', '$http', '$window', 'AppSettings', 'SearchService', 'Fullscreen', WallDisplay]);
