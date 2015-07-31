'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */

controllersModule.controller('MapCtrl', [ '$rootScope', 'MapCreationService' , function($rootScope, MapCreationService) {

    var vm = this;
    vm.failNoticeShown = false;


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
        })
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
    }


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
                cbOnMapAction: function() { /*Do nothing when map in created */ }
            });                
        }
    })

}]);

