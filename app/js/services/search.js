'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SearchService($q, $http, AppSettings) {

  var service = {};

  service.getStatuses = function(term) {
    var deferred = $q.defer();

    $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
      params: {q: term}
    }).success(function(data) {
        deferred.resolve(data.statuses);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  return service;

}

servicesModule.service('SearchService', SearchService);