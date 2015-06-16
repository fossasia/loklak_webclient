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

  service.debugLinkSync = function(undebuggedLink) {
    var query = 'http://gofullstack.me:8061/oembed?url=' + encodeURIComponent(undebuggedLink);
    var request = new XMLHttpRequest();
    request.open('GET', query, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      return (JSON.parse(request.responseText));
    }
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