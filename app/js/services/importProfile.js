'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function ImportProfileService($q, $http, AppSettings) {
	
	var service = {};

	service.update = function(item) {
		var deferred = $q.defer();
		var params = {action : 'update', data : item};
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
		var params = {action : 'delete', source_url : item.source_url};
		if (item.screen_name && item.screen_name.length > 0) {
			params['screen_name'] = item.screen_name;
		} else {
			params['client_host'] = item.client_host;
		}
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

servicesModule.service('ImportProfileService',['$q', '$http', 'AppSettings', ImportProfileService]);
