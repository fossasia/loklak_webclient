'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */

servicesModule.service('DebugLinkService',['$q', '$http', 'AppSettings', function($q, $http, AppSettings) {
  //Given domain 

  var getPosition = function(str, m, i) {
         return str.split(m, i).join(m).length;
  };
  
  var debugServiceApi = (function() {
    var domain = AppSettings.linkDebuggingServiceHost;
    if (domain.match(/:/g).length > 1) {
       var indexOfPort = getPosition(domain, ":", 2);
       domain = domain.substr(0, indexOfPort);
    }

    return domain + ':' + AppSettings.linkDebuggingServicePort;
  })();

  var service = {};

  service.debugLink = function(undebuggedLink) {
    var deferred = $q.defer();
    var debugApiUrl = debugServiceApi + '/oembed';
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
    var query = debugServiceApi + '/oembed?url=' + encodeURIComponent(undebuggedLink);
    var request = new XMLHttpRequest();
    request.open('GET', query, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      return (JSON.parse(request.responseText));
    }
  };

  service.debugLinkIframely = function(undebuggedLink) {
    var deferred = $q.defer();
    var debugApiUrl = debugServiceApi + '/iframely';
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