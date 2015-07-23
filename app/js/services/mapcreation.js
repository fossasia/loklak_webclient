'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */

function MapCreationService(MapPopUpTemplateService, SearchService) {

    var service = {};
    var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>';
    var mapId = 'examples.map-20v6611k';

    var initMapPoints = function (statuses) {
        var tweets = { "type": "FeatureCollection", "features": []};
        statuses.forEach(function(status) {
            if (status.location_mark && status.user) {
                var text = MapPopUpTemplateService.genStaticTwitterStatus(status);
                var pointObject = {
                    "geometry": {"type": "Point", "coordinates": [status.location_mark[0], status.location_mark[1]]},
                    "type": "Feature",
                    "properties": {"popupContent": "<div class='foobar'>" + text + "</div>"},
                    "id": status.id_str
                };
                tweets.features.push(pointObject);
            }
        });
        return tweets;
    }

    var addPointsToMap = function(map, tweets, callbackOnMapPoints) {
        function onEachFeature(feature, layer) {
            var popupContent; 
            if (feature.properties && feature.properties.popupContent) {
                popupContent = feature.properties.popupContent;
            }
            layer.bindPopup(popupContent);
        }
        L.geoJson([tweets], {
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
     
        callbackOnMapPoints();
    }

    service.initMap = function(data, mapId, callbackOnMapPoints) {
        window.map = L.map(mapId).setView(new L.LatLng(5.3,-4.9), 2);
        var tweets = initMapPoints(data);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution,
            id: mapId
        }).addTo(window.map);

        addPointsToMap(window.map, tweets, callbackOnMapPoints);
    }  

    service.getLocationParamFromBound = function(bound) {
        var longWest = parseFloat(bound._southWest.lng);
        var latSouth = parseFloat(bound._southWest.lat);
        var longEast = parseFloat(bound._northEast.lng);
        var latNorth = parseFloat(bound._northEast.lat);
        var locationParam = "/location=" + longWest + "," + latSouth + "," + longEast + "," + latNorth;
        return locationParam;
    }

    service.addLocationFromUser = function(noLocationStatuses) {
        noLocationStatuses.forEach(function(ele, index) {
            if (ele.user) {
                SearchService.getUserInfo(ele.user.screen_name).then(function(userInfo) {
                    if (userInfo.user && userInfo.user.location_mark) {
                        ele.location_mark = userInfo.user.location_mark;    
                    }
                    if (index === noLocationStatuses.length - 1) {
                        // After getting the last one's userinfo, start adding points to map
                        addPointsToMap(window.map, initMapPoints(noLocationStatuses));    
                    }
                }, function() {});
            }
        });
    }

    service.addPointsToMap = addPointsToMap;
    service.initMapPoints = initMapPoints;
    return service;

}

servicesModule.service('MapCreationService', ["MapPopUpTemplateService", "SearchService", MapCreationService]);
