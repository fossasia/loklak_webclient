'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function tokenInjectorService($window) {
    var tokenInjector = {
        request: function(config) {
            // var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];
            // var requestUrl = config.url.split('/')[0] + '/' + config.url.split('/')[1] + '/' + config.url.split('/')[2];
            // if (requestUrl === url) {
            //     var auth = HelloService('twitter').getAuthResponse();
            //     if (auth) {
            //         config.headers['x-access-token'] = auth.access_token;
            //         config.headers['x-screen-name'] = auth.screen_name;
            //     }
            // }
            
            config.headers['Authorization'] = 'Bearer '+ $window.localStorage['jwt-token'];
            return config;
        }
    };
    return tokenInjector;
}

servicesModule.factory('tokenInjector', ['$window', tokenInjectorService]);
