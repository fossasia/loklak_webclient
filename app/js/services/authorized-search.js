'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function AuthorizedSearchService($q, $http, AppSettings) {

  var service = {};
  var ProxyApiUrl = AppSettings.oauthProxyUrl.replace("oauthproxy", "");
  window.ProxyApiUrl = ProxyApiUrl;

  service.getLoggedInAccountInfo = function(screen_name, token, secret) {
      var deferred = $q.defer();
      $http.get(ProxyApiUrl+'authorized?', {
        params: {
          servlet: "account",
          screen_name: screen_name,
          oauth_token: token,
          oauth_token_secret: secret
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

servicesModule.service('AuthorizedSearch',['$q', '$http', 'AppSettings', AuthorizedSearchService]);
