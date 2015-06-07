'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function SearchService($q, $http, AppSettings) {

  var service = {};

  service.getData = function(term) {
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

  service.initData = function(paramsObj) {
    var deferred = $q.defer();
    paramsObj.q = decodeURIComponent(paramsObj.q);
    $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
      params: paramsObj
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
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

  service.debugLink = function(linkHref) {
    var deferred = $q.defer();
    var debugApiUrl = 'http://api.embed.ly/1/oembed?';
    $http.jsonp(debugApiUrl, {
      params: {
        key: 'f62eb52b53da4353843eed37c1e977fd',
        url: linkHref
      }
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };


  return service;

}

servicesModule.service('SearchService', SearchService);