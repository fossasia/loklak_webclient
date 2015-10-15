'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SearchService($q, $http, $rootScope, AppSettings) {

  var service = {};

  $rootScope.root.numberOfFailedReq = 0;
  var evalNumberOfFailure = function(status) {
    if (status === 404 || status === 503) {
      $rootScope.root.numberOfFailedReq += 1;
    }
  }

  service.getData = function(term) {
      $rootScope.root.aSearchWasDone = true;
      $rootScope.httpCanceler = $q.defer();
      var deferred = $q.defer();

      $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
        params: {q: term, minified: true},
        timeout: $rootScope.httpCanceler.promise
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          evalNumberOfFailure(status);
          deferred.reject(err, status);
      });

      return deferred.promise; 
  };

  service.getLocationSuggestions = function(term) {
      var deferred = $q.defer();
      $http.jsonp(AppSettings.apiUrl+'suggest.json?callback=JSON_CALLBACK', {
        params: {
          q: term,
          source: "geo",
          minified: "true"
        }
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          deferred.reject(err, status);
      });

      return deferred.promise;
  };

  service.getSearchSuggestions = function(term) {
      $rootScope.suggestionsHttpCanceler = $q.defer();
      var deferred = $q.defer();
      $http.jsonp(AppSettings.apiUrl+'suggest.json?callback=JSON_CALLBACK', {
        params: {
          q: term,
          orderby: "query_count",
          order: "desc",
          minified: true
        }
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          deferred.reject(err, status);
      });

      return deferred.promise;
  };

  service.initData = function(paramsObj) {
      $rootScope.root.aSearchWasDone = true;
      $rootScope.httpCanceler = $q.defer();
      var deferred = $q.defer();
      //paramsObj.q = decodeURIComponent(paramsObj.q);
      $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
        params: paramsObj,
        ignoreLoadingBar: paramsObj.fromWall,
        timeout: $rootScope.httpCanceler.promise
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          evalNumberOfFailure(status);
          deferred.reject(err, status);
      });

      return deferred.promise;
  };

  service.getTrendsAggregation = function(paramsObj) {
        var deferred = $q.defer();
        $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
          params: paramsObj,
          ignoreLoadingBar: paramsObj.fromWall
        }).success(function(data) {
            deferred.resolve(data);
        }).error(function(err, status) {
            deferred.reject(err, status);
        });

        return deferred.promise;
    };


  service.retrieveImg = function(user_screen_name) {
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'user.json?callback=JSON_CALLBACK', {
      params: {screen_name: user_screen_name}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  service.retrieveMultipleImg = function(user_screen_name_array) {
    var combined_user_screen_names = user_screen_name_array.join(",");
    console.log(combined_user_screen_names);
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'user.json?callback=JSON_CALLBACK', {
      params: {screen_name: combined_user_screen_names}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  service.retrieveTopology = function(user_screen_name, limit) {
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'user.json?callback=JSON_CALLBACK', {
      params: {
        screen_name: user_screen_name,
        following: limit,
        followers: limit
      }
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  service.getImportProfiles = function(sourceType, screen_name) {
    // screen_name is required
    if (!screen_name) {
      return;
    }
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'import.json?callback=JSON_CALLBACK', {
      params: {source_type : sourceType.toUpperCase(), screen_name: screen_name}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };
  return service;

}

servicesModule.service('SearchService',['$q', '$http', '$rootScope', 'AppSettings', SearchService]);
