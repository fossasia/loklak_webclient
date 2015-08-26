'use strict';
/* global angular, $ */

var controllersModule = require('./_index');

/**
 * @ngInject
 */

controllersModule.controller('MapCtrl', [ '$rootScope', '$scope', 'MapCreationService', 'HelloService', 'SearchService' , function($rootScope, $scope, MapCreationService, hello, SearchService) {

    var vm = this;
    vm.feedLimit = 20;
    vm.failNoticeShown = false;
    vm.isShowingMapNotHome = false;
    vm.showFollowersLimit = 20;
    vm.showFollowingsLimit = 20;


    /* MAP VIEW MODELS */
        /*
         * Since the map creation process is abstracted to be reused across all view
         * , a 'user' property is needed for the map creation
         */
        function addUserProp(topology) {
            topology.forEach(function(ele) {
                ele.user = {
                    "screen_name" : ele.screen_name,
                    "user_id" : ele.id_str,
                    "name" : ele.name,
                    "profile_image_url_https" : ele.profile_image_url_https,
                };
            });
        }    

        /*
         * Stimulate a marker's clicking's trigger
         * userID of feed will be matched with id of the marker
         * toggle notice if marker is not available
         */
        vm.openPopup = function(userId) {
            if (window.mapViewMarker[userId]) {
                $(".location-fail-notice").fadeOut();
                vm.failNoticeShown = false;

                window.map.panTo(window.mapViewMarker[userId]._latlng);
                window.mapViewMarker[userId].openPopup();    
                
            } else {
                if (vm.failNoticeShown) { $(".location-fail-notice").fadeOut(200).fadeIn(200); } 
                window.map.closePopup();
                $(".location-fail-notice").fadeIn();
                vm.failNoticeShown = true;
            } 
        };


        /* 
         * Callback after map is created 
         * Most of these are DOM manipulation, which is relevant only when map is created
         */
        var cbOnMap = function() { 
            var hintText = '<p class="map-control-hint-text">The first number shows the actual followers. The second number shows the number of followers with a location info. These are displayed on the map.</p>';
            $(".leaflet-control-layers-overlays").append(hintText);
            $(".map-control-hint").hover(function() {
                $(".map-control-hint-text").show();
            }, function() {
                $(".map-control-hint-text").hide();
            });

            // Switching between Following/Followers/Follow buttons
            // Regardless of the code here, you can easily understand what it means why testing on live.
            $('#map').on('mouseover', '.following-button, .follower-and-following-button', function() {
                $(this).text("Unfollow"); $(this).toggleClass('following-button'); $(this).toggleClass('unfollow-button');
            });
            $('#map').on('mouseout', '.unfollow-button', function() {
                $(this).text("Following"); $(this).toggleClass('following-button'); $(this).toggleClass('unfollow-button');
            });
            $('#map').on('mouseover', '.follower-button', function() {
                $(this).text("Follow"); $(this).toggleClass('follower-button'); $(this).toggleClass('follow-button');
            });
            $('#map').on('mouseout', '.follow-button', function() {
                $(this).text("Follower"); $(this).toggleClass('follower-button'); $(this).toggleClass('follow-button');
            });

            $('#map').on('click', '.unfollow-button', function() {
                $(this).text("Follow"); $(this).toggleClass('unfollow-button'); $(this).toggleClass('fresh-follow-button');
                var id_str = $(this).attr("id").replace("user-", "");
                hello('twitter').api('me/unfollow', 'POST', {
                    user_id: id_str
                }).then(function (json) {
                    $(this).text("Follow"); $(this).toggleClass('follower-button'); $(this).toggleClass('follow-button');
                }, function(e) {
                    console.log(e);
                });
            });

            $('#map').on('click', '.follow-button, .fresh-follow-button', function() {
                var id_str = $(this).attr("id").replace("user-", "");
                $(this).text("Following"); $(this).addClass('following-button'); $(this).removeClass('follow-button'); $(this).removeClass('fresh-follow-button');
                hello('twitter').api('me/follow', 'POST', {
                    user_id: id_str
                }).then(function (json) {
                }, function(e) {
                    console.log(e);
                });
            });
        };

        // START MAP WHEN DATA IS RETURNED
        $rootScope.$watch(function() {
            return $rootScope.userTopology;
        }, function(val) {
            if (val) {
                if (window.map) { delete(window.map); }
        
                var topologyPool = $rootScope.userTopology.followers.concat($rootScope.userTopology.following);
                addUserProp(topologyPool);
                MapCreationService.initMap({
                    data: topologyPool,
                    mapId: "map",
                    templateEngine: "genUserInfoPopUp",
                    markerType: "userAvatar",
                    cbOnMapAction: cbOnMap
                });  
            }
        });


        $rootScope.$watch(function() {
            return $rootScope.root.activityFeedIdStrArray;
        }, function(val) {
            if (val.length > 0) {
                var idStrArrayClone = val.slice();
                idStrArrayClone[0] = "id:" + idStrArrayClone[0];
                var idStrSearchTerm = idStrArrayClone.join(" OR id:");
                console.log(idStrSearchTerm);
                SearchService.getData(idStrSearchTerm).then(function(activityFeedFromLoklak) {
                    console.log(activityFeedFromLoklak);
                }, function() {});    
            }
        });

        /*
         * Manual code for scroll down to load more feature
         * The basis for this implementation is based on how
         * ele's clientHeight, scrollHeight & scrollTop is calculated
         * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
         */
        function hasReachBottom() {
            var element = document.getElementsByClassName("activity-feed")[0];
            var maxScroll = element.scrollHeight - element.clientHeight - 200;
            var currentScrollTop = $(".activity-feed").scrollTop();
            return currentScrollTop >= maxScroll ? true : false;
        }

        angular.element(document).ready(function() {
            $(".activity-feed").scroll(function() {
                if (hasReachBottom()) {
                    $scope.$apply(function() {
                        vm.feedLimit += 20;    
                    });
                    console.log("");
                }
            });
        });


        /*
         * Toggle map feed to slide left/hide or slide right/show
        */
        vm.toggleMapFeed = function() {
            // Push effect between map and activity feed
            // Map is pushed to the left, feed slides in the right, and vice versa
            angular.element('#map, .logged-content.map-container-parent.moved-right').toggleClass("unpush-map");
            angular.element('.center-result-container, .left-result-container').toggleClass("hide-feed");
            angular.element('.toggle-map-feed').toggleClass('fa-chevron-circle-left').toggleClass('fa-chevron-circle-right');
            setTimeout(function() {
                angular.element('#map, .logged-content.map-container-parent.moved-right').toggleClass("unpushed");
                angular.element('.center-result-container, .left-result-container').toggleClass("hidden-feed");
            }, 500);            

            // Only show switch to timeline when activity feed is shown
            //angular.element(".switch-to-timeline").toggleClass("switch-inactive");
        };

    /* TIMELINE VIEW MODELS */
    vm.showAllFollowers = function() {
        vm.showFollowersLimit = $rootScope.userTopology.followers.length;
    };

    vm.showAllFollowings = function() {
        vm.showFollowingsLimit = $rootScope.userTopology.following.length;
    };

    /* SWITCHING BETWEEN TIMELINE AND MAP */
    vm.timelineState = true;
    vm.toggleMapAndTimeline = function() {
        //vm.isShowingMapNotHome = !vm.isShowingMapNotHome;        
        $(".center-result-container, .right-result-container, .left-result-container, .logged-content.map-container-parent").toggleClass("moved-right");
        $(".home-view-content-wrapper > .content-container").toggleClass("moved-right");
        vm.timelineState = !vm.timelineState;  

    };

}]);
