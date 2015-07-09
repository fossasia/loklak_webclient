'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SearchService($q, $http, AppSettings) {

  var service = {};

  var lastSearch, newSearch;
  var preventBubbleSearch = function() {
    if (!lastSearch) {
      lastSearch = new Date();
      return true;
    } else {
      newSearch = new Date();
      var interval = newSearch - lastSearch;
      if (interval > 1000) {
        lastSearch = newSearch;
        return true;
      } else {
        return false;
      }
    }
  }

  service.getData = function(term) {
    if (preventBubbleSearch()) {
      var deferred = $q.defer();

      $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
        params: {q: term}
      }).success(function(data) {
          deferred.resolve(data);
      }).error(function(err, status) {
          deferred.reject(err, status);
      });

      return deferred.promise;
    }
    
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

  service.initData = function(paramsObj) {
    if (preventBubbleSearch()) {
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
    }
  };

  service.retrieveImg = function(statusID) {
    var deferred = $q.defer();
    $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
      params: {q : 'id:' + statusID}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  return service;

}

servicesModule.service('SearchService',['$q', '$http', 'AppSettings', SearchService]);
