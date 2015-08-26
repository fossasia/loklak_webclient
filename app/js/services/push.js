'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function PushService($q, $http, AppSettings, $rootScope) {

	var service = {};

	service.pushData = undefined;

	/* 'params' object can contain following values (some are required) :
		- url* : url of the source
		- source type* : source format & origine, e.g. Twitter
		- harvesting_freq : harvesting frequency of the data
		- lifetime : data lifetime
		- public : set to true to make data public for other users
	*/
	service.pushCustomData = function(params, endpoint) {
		if (!$rootScope.root.twitterSession) {
			console.err("Unable to push message of unauthenticated user");
			return;
		}
		params.screen_name = $rootScope.root.twitterSession.screen_name;
		var deferred = $q.defer();
		$http.jsonp(AppSettings.apiUrl+'push/' + endpoint + '?callback=JSON_CALLBACK', {
			params: params
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(err, status) {
				deferred.reject(err, status);
			});
		return deferred.promise;
	};

	/* 'params' object can contain following values (some are required) :
		- url* : url of the source
		- source type* : source format & origine, e.g. Twitter
		- map_type : map rules to map custom data to loklak backend
		- harvesting_freq : harvesting frequency of the data
		- lifetime : data lifetime
		- public : set to true to make data public for other users
		For detailed list checkout http://loklak.org/api.html#geojsonpush
	*/
	service.pushGeoJsonData = function(params) {
		if (!$rootScope.root.twitterSession) {
			console.err("Unable to push message of unauthenticated user");
			return;
		}
		params.screen_name = $rootScope.root.twitterSession.screen_name;
		var deferred = $q.defer();
		$http.jsonp(AppSettings.apiUrl+'push/geojson.json?callback=JSON_CALLBACK', { 
			params: params }).success(function(data) {
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
	};

	return service;
}

servicesModule.service('PushService',['$q', '$http', 'AppSettings', '$rootScope', PushService]);
