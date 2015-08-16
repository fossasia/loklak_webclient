'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */

function MapCreationService($rootScope, MapPopUpTemplateService, SearchService) {

    var service = {};
    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var mapId = 'examples.map-20v6611k';
    var tileLayerSrc = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

    function initMapPoints(statuses, templateEngine) {
        var tweets = { "type": "FeatureCollection", "features": []};
        statuses.forEach(function(status) {
            var isAFollower = (status.isAFollower) ? true : false;
            var isAFollowing = (status.isAFollowing) ? true : false;
            var geo_enabled = (status.location_mark) ? true: false;
            if (status.location_mark && status.user) {
                var text = MapPopUpTemplateService[templateEngine](status);
                var pointObject = {
                    "geometry": {"type": "Point", "coordinates": [status.location_mark[0], status.location_mark[1]]},
                    "type": "Feature",
                    "properties": {"popupContent": "<div class='foobar'>" + text + "</div>"},
                    "id": status.id_str,
                    "propic" : status.user.profile_image_url_https,
                    "isAFollower": isAFollower,
                    "isAFollowing": isAFollowing,
                    "geo_enabled": geo_enabled
                };
                tweets.features.push(pointObject);
            }
        });
        return tweets;
    }

    function addPointsToMap(map, tweets, markerType, cbOnMapAction) {
        var addLayer;
        if (markerType === "simpleCircle") {
            function onEachFeature(feature, layer) {
                var popupContent;
                if (feature.properties && feature.properties.popupContent) {
                    popupContent = feature.properties.popupContent;
                }
                layer.bindPopup(popupContent);
            }

            addLayer = L.geoJson([tweets], {
                style: function (feature) { return feature.properties && feature.properties.style; },
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
        } else if (markerType === "userAvatar") {
            window.mapViewMarker = [];
            var followers = L.layerGroup();
            var followings = L.layerGroup();
            var numFollowingsOnMap = 0;
            var numFollowersOnMap = 0;

            tweets.features.forEach(function(tweet) {
                window.mapViewMarker[tweet.id] = new L.Marker([tweet.geometry.coordinates[1], tweet.geometry.coordinates[0]], {
                    id: tweet.id,
                    icon: L.icon({iconUrl: tweet.propic, iconSize: [30, 30], className: "topologyItem"})
                }).bindPopup(tweet.properties.popupContent);

                if (tweet.isAFollower) {
                    followers.addLayer(window.mapViewMarker[tweet.id]);
                } else {
                    followings.addLayer(window.mapViewMarker[tweet.id]);
                }

                if (tweet.geo_enabled) {
                    if (tweet.isAFollower) {
                        numFollowersOnMap += 1;
                    } else {
                        numFollowingsOnMap += 1;
                    }
                }
            })

            followers.addTo(window.map);
            followings.addTo(window.map);

            var numFollowings = $rootScope.userTopology.noOfFollowings ? "Followings " + $rootScope.userTopology.noOfFollowings : "Followings";
            var numFollowers = $rootScope.userTopology.noOfFollowers ? "Followers " + $rootScope.userTopology.noOfFollowers : "Followers";
            var controlOptions = {};
            controlOptions[numFollowers + "/" + numFollowersOnMap + '<span class="map-control-hint"> (i) </span>'] = followers;
            controlOptions[numFollowings + "/" + numFollowingsOnMap + '<span class="map-control-hint"> (i) </span>'] = followings;

            L.control.layers({}, controlOptions, {position: 'topleft'}).addTo(window.map);
           
        }
            
        cbOnMapAction();
        return addLayer;
    }

    function getLocationParamFromBound(bound) {
        var longWest = parseFloat(bound._southWest.lng);
        var latSouth = parseFloat(bound._southWest.lat);
        var longEast = parseFloat(bound._northEast.lng);
        var latNorth = parseFloat(bound._northEast.lat);
        var locationParam = "/location=" + longWest + "," + latSouth + "," + longEast + "," + latNorth;
        return locationParam;
    }

    function addLocationFromUser(noLocationStatuses) {
        noLocationStatuses.forEach(function(ele, index) {
            if (ele.user && ele.user.profile_image_url_https) {
                SearchService.getUserInfo(ele.user.screen_name).then(function(userInfo) {
                    if (userInfo.user && userInfo.user.location_mark) {
                        ele.location_mark = userInfo.user.location_mark;    
                    }
                    if (index === noLocationStatuses.length - 1) {
                        // After getting the last one's userinfo, start adding points to map
                        addPointsToMap(window.map, initMapPoints(noLocationStatuses), "simpleCircle", function() {});    
                    }
                }, function() {});
            }
        });
    }

    /*
     * Main fn to intialize map, require
     * data: array of statuses
     * mapId : id of html container for map, # is not needed
     * markerType : define the type of marker, a circle? a picture? ..v..
     * templateEngine: define how pop up template is generated
     * cbOnMapAction: cb after map initialization, usually to add listeners to events
     *
     */
    function initMap(params) {
        var data = params.data;
        var mapId = params.mapId;
        var markerType = params.markerType
        var templateEngine = params.templateEngine;
        var cbOnMapAction = params.cbOnMapAction;

        // Reassure that old map is remove
        delete(window.map); 
        angular.element("#" + mapId).remove();
        angular.element(".map-container-parent").prepend('<div id="' + mapId + '"></div>');

        window.map = L.map(mapId).setView(new L.LatLng(5.3,-4.9), 2);
        var tweets = initMapPoints(data, templateEngine);
        L.tileLayer(tileLayerSrc, {
            maxZoom: 18,
            attribution: attribution,
            id: mapId
        }).addTo(window.map);

        addPointsToMap(window.map, tweets, markerType, cbOnMapAction);
    }  


    service.initMap = initMap;
    service.addPointsToMap = addPointsToMap;
    service.initMapPoints = initMapPoints;
    service.getLocationParamFromBound = getLocationParamFromBound;
    service.addLocationFromUser = addLocationFromUser;
    
    return service;

}

servicesModule.service('MapCreationService', ["$rootScope", "MapPopUpTemplateService", "SearchService", MapCreationService]);
