'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function ImportProfileService($q, $http, $rootScope, AppSettings) {
	
	var service = {};

	service.update = function(item) {
		var deferred = $q.defer();
		var params = {action : 'update', data : item, screen_name : $rootScope.root.twitterSession.screen_name};
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
		var params = {action : 'delete', source_url : item.source_url, screen_name : $rootScope.root.twitterSession.screen_name};
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

	service.share = function(item) {
		if (!item.sharers) {
			item.sharers = [];
		}
		if (item.sharers.indexOf($rootScope.root.twitterSession.screen_name) !== -1) {
			console.error('You already shared this data');
			return;
		}
		item.sharers.push($rootScope.root.twitterSession.screen_name);
		return service.update(item);
	}

	return service;
}

servicesModule.service('ImportProfileService',['$q', '$http', '$rootScope', 'AppSettings', ImportProfileService]);
