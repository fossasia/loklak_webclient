'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function PushService($q, $http, AppSettings) {

	var service = {};

	service.pushData = undefined;
	
	service.pushGeoJsonData = function(url, source_type, map_type) {
		var deferred = $q.defer();

		$http.jsonp(AppSettings.apiUrl+'push/geojson.json?callback=JSON_CALLBACK', {
			params: {url: url, source_type : source_type | 'IMPORT', map_type : map_type}
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(err, status) {
				deferred.reject(err, status);
			});
			return deferred.promise;
	};

	return service;
}

servicesModule.service('PushService',['$q', '$http', 'AppSettings', PushService]);
