'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function StatisticsService($q, $http, AppSettings) {

  var service = {};

  service.getStatistics = function(term, sinceDate, untilDate) {
    var deferred = $q.defer();
    term = term + ' since:' + sinceDate + ' until:' + untilDate;
    var tzo = new Date().getTimezoneOffset();
    $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
      params: {q: term, timezoneOffset: tzo,
                source: 'cache', count: '0',
                fields: 'created_at,screen_name,mentions,hashtags'}
    }).success(function(data) {
        deferred.resolve(data.aggregations);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  return service;

}

servicesModule.service('StatisticsService',['$q', '$http', 'AppSettings', StatisticsService]);