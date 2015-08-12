'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SearchService($q, $http, $rootScope, AppSettings) {

  var service = {};

  service.getData = function(term) {
      $rootScope.root.aSearchWasDone = true;
      var deferred = $q.defer();

      $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
        params: {q: term}
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          deferred.reject(err, status);
      });

      return deferred.promise; 
  };

  service.getLocationSuggestions = function(term) {
      var deferred = $q.defer();
      $http.jsonp(AppSettings.apiUrl+'suggest.json?callback=JSON_CALLBACK', {
        params: {
          q: term,
          source: "geo"
        }
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          deferred.reject(err, status);
      });

      return deferred.promise;
  };

  service.getSearchSuggestions = function(term) {
      var deferred = $q.defer();
      $http.jsonp(AppSettings.apiUrl+'suggest.json?callback=JSON_CALLBACK', {
        params: {
          q: term,
          orderby: "query_count",
          order: "desc"
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
      var deferred = $q.defer();
      //paramsObj.q = decodeURIComponent(paramsObj.q);
      $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
        params: paramsObj
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

  service.getImportProfiles = function(sourceType) {
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'import.json?callback=JSON_CALLBACK', {
      params: {source_type : sourceType.toUpperCase()}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  }
  return service;

}

servicesModule.service('SearchService',['$q', '$http', '$rootScope', 'AppSettings', SearchService]);
