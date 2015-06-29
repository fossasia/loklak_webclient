'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function AccountsService($q, $http, AppSettings) {

  var service = {};

  service.updateData = function(obj) {
    var deferred = $q.defer();
    var temp = AppSettings.oauthProxyUrl.split('/');
    $http.post('http://localhost:3000/updateData', {
      params: {data: obj}
    }).success(function(data) {
        deferred.resolve(data);
    }).error(function(err, status) {
        deferred.reject(err, status);
    });

    return deferred.promise;
  };

  return service;

}

servicesModule.service('AccountsService',['$q', '$http', 'AppSettings', AccountsService]);
