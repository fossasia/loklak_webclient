'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function PushService($q, $http, AppSettings, $rootScope) {

	var service = {};

	service.pushData = undefined;

	service.pushCustomData = function(url, endpoint, harvesting_freq, lifetime) {
		if (!$rootScope.root.twitterSession) {
			console.err("Unable to push message of unauthenticated user");
			return;
		}
		var deferred = $q.defer();
		$http.jsonp(AppSettings.apiUrl+'push/' + endpoint + '?callback=JSON_CALLBACK', {
			params: {url: url, harvesting_freq : harvesting_freq, lifetime : lifetime, screen_name: $rootScope.root.twitterSession.screen_name}
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(err, status) {
				deferred.reject(err, status);
			});
		return deferred.promise;
	};

	service.pushGeoJsonData = function(url, source_type, map_type, harvesting_freq, lifetime) {
		if (!$rootScope.root.twitterSession) {
			console.err("Unable to push message of unauthenticated user");
			return;
		}
		var deferred = $q.defer();
		$http.jsonp(AppSettings.apiUrl+'push/geojson.json?callback=JSON_CALLBACK', {
			params: {
				url: url, source_type : source_type || 'IMPORT', 
				map_type : map_type, harvesting_freq : harvesting_freq, lifetime : lifetime,
				screen_name: $rootScope.root.twitterSession.screen_name
			}}).success(function(data) {
				deferred.resolve(data);
			}).error(function(err, status) {
				deferred.reject(err, status);
			});
		return deferred.promise;
	};

	service.validate = function(url, source_type) {
		var deferred = $q.defer();
		$http.jsonp(AppSettings.apiUrl+'validate.json?callback=JSON_CALLBACK', {
			params: {url: url, source_type : source_type}
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(err, status) {
				console.log(status);
				deferred.reject(err, status);
			});
		return deferred.promise;
	}

	return service;
}

servicesModule.service('PushService',['$q', '$http', 'AppSettings', '$rootScope', PushService]);
