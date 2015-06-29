'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function StatisticsService($q, $http, AppSettings) {

    var service = {};

    service.getStatistics = function(params) {
        var deferred = $q.defer();
        var tzo = new Date().getTimezoneOffset();
        // params.timezoneOffset = tzo;
        // params.source = 'cache';
        // params.count = '0';
        // params.fields = 'created_at,screen_name,mentions,hashtags';
        $http.jsonp(AppSettings.apiUrl + 'search.json?callback=JSON_CALLBACK' + '&timezoneOffset=' + tzo + '&source=cache' + '&count=0' + '&fields=created_at,screen_name,mentions,hashtags' + '&q=' + encodeURIComponent(params.q)).success(function(data) {
            deferred.resolve(data.aggregations);
        }).error(function(err, status) {
            deferred.reject(err, status);
        });

        return deferred.promise;
    };


    return service;

}

servicesModule.service('StatisticsService', ['$q', '$http', 'AppSettings', StatisticsService]);
