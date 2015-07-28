'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */

controllersModule.controller('MapCtrl', [ '$rootScope', 'MapCreationService' , function($rootScope, MapCreationService) {

    var vm = this;

    /*
    Requirement
      - A news feed on the right with latest content  
      - Map plot on the left with followings & followers
    => Model needed: Followers, followings along with location_mark
    => New feeds along with users screen name

    Approach for map plot:
    - When load map or login, get 500 for each topology.
    - When load map, just plot those followers/followings first with separate layers, along with some basic mock up
    - Retain ID of markers' plot to later stimulate a trigger when clicking on new feeds

    Approach for news feed:
    - If hello js succeeded in getting new feeds
      + Display the feed
      + ID of user can be retrieved from each feed, use that to assign and stimulate trigger on map
      + If the user is not on the map, simply inform that user does not enable geo location :)

    - If hello js failed, use search.json for each node of the topology, will be MUCH MUCH slower
      + While processing data in the background, inform that loading failed, show a, e.g. ajax loading gif
      + Get ~ 50 feeds (), show panel already when got 10 feeds
      + Again, attach trigger
    */

    function addUserProp(topology) {
        topology.forEach(function(ele) {
            ele.user = {
                "screen_name" : ele.screen_name,
                "user_id" : ele.id_str,
                "name" : ele.name,
                "profile_image_url_https" : ele.profile_image_url_https,
            };
        })
    }    



    $rootScope.$watch(function() {
        return $rootScope.userTopology;
    }, function(val) {
        if (val) {
            var topologyPool = $rootScope.userTopology.followers.concat($rootScope.userTopology.following);
            addUserProp(topologyPool);
            MapCreationService.initMap({
                data: topologyPool,
                mapId: "map",
                templateEngine: "genUserInfoPopUp",
                markerType: "userAvatar",
                cbOnMapAction: function() {
                // Do nothing when map in created
                }
            });                
        }
    })


    vm.openPopup = function(userId) {
        console.log(userId);
        if (window.mapViewMarker[userId]) {
            window.mapViewMarker[userId].openPopup();    
            // Then center to the current popup
        } else {
            alert("The user you're searching doesn't have geolocation enabled");
            // Create some clever notice/effect here!
        } 
    }


}]);

