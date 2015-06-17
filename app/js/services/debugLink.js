'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */

servicesModule.service('DebugLinkService',['$q', '$http', function($q, $http) {
  var service = {};

  service.debugLink = function(undebuggedLink) {
    var deferred = $q.defer();
    var debugApiUrl = 'http://gofullstack.me:8061/oembed';
    $http.get(debugApiUrl, {
      params: {
        url: undebuggedLink,
      }
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  service.debugLinkIframely = function(undebuggedLink) {
    var deferred = $q.defer();
    var debugApiUrl = 'http://gofullstack.me:8061/iframely';
    $http.get(debugApiUrl, {
      params: {
        url: undebuggedLink,
      }
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };


  return service;
}]);