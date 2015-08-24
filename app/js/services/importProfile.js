'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function ImportProfileService($q, $http, $rootScope, AppSettings) {
	
	var service = {};

	service.update = function(item) {
		var deferred = $q.defer();
		var params = {action : 'update', data : item, screen_name : $rootScope.root.twitterSession};
		$http.jsonp(AppSettings.apiUrl
			+'import.json?callback=JSON_CALLBACK', {
			params: params, method: 'POST'
		}).success(function(data) {
			deferred.resolve(data);
		}).error(function(err, status) {
			deferred.reject(err, status);
		});
		return deferred.promise;
	};

	service.delete = function(item) {
		var deferred = $q.defer();
		var params = {action : 'delete', source_url : item.source_url, screen_name : $rootScope.root.twitterSession};
		$http.jsonp(AppSettings.apiUrl
			+'import.json?callback=JSON_CALLBACK', {
			params: params
		}).success(function(data) {
			deferred.resolve(data);
		}).error(function(err, status) {
			deferred.reject(err, status);
		});
		return deferred.promise;
	};

	return service;
}

servicesModule.service('ImportProfileService',['$q', '$http', '$rootScope', 'AppSettings', ImportProfileService]);
