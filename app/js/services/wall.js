'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */

function WallService($q, $http, AppSettings) {
	var service = {};

	service.getData = function (term) {
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

	service.initData = function(paramsObj) {
		var deferred = $q.defer();

		$http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
			params: paramsObj
		}).success(function(data) {
			deferred.resolve(data);
		}).error(function(err, status) {
			deferred.reject(err, status);
		});

		return deferred.promise;
	};

	return service;
}

servicesModule.service('WallService', WallService);