'use strict';

var servicesModule = require('./_index.js');
/**
 * @ngInject
 */
function AuthenticationService($http, $window) {

    var saveToken = function (token) {
      $window.localStorage['jwt-token'] = token;
    };

    var getToken = function () {
      return $window.localStorage['jwt-token'];
    };

    var isLoggedIn = function() {
      var token = getToken();
      var payload;

      if(token){
        payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    var currentUser = function() {
      if(isLoggedIn()){
        var token = getToken();
        var payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);
        // console.log(payload);
        // no need for exp, iat, _id fields
        return {
          _id: payload._id,
          email : payload.email,
          name : payload.name
        };
      }
    };

    var register = function(user) {
      return $http.post('/api/register', user).success(function(data){
        saveToken(data.token);
      });    
    };

    var login = function(user) {
      return $http.post('/api/login', user).success(function(data) {
        saveToken(data.token);
      });
    };

    var logout = function() {
      $window.localStorage.removeItem('jwt-token');
    };

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      register : register,
      login : login,
      logout : logout
    };
  }
  

  servicesModule.service('AuthService',['$http', '$window', AuthenticationService]);

