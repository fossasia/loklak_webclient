'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function AppsService($q, $http, $resource, AppSettings) {

    var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];
    
    return $resource(url + '/:user/:app/:id', {
        user: '@user',
        app: '@app',
        id: '@id'
    }
    , {
        save: {
            method: 'POST',
            transformRequest: function(data) {
                delete data.user;
                delete data.app;
                delete data.showLoading;
                return JSON.stringify(data);
            },
            params: {
                user: '@user',
                app: '@app',
                id: '@id'
            }
        },
        update: {
            method: 'PUT',
            transformRequest: function(data) {
                delete data.user;
                delete data.app;
                delete data.showLoading;
                return JSON.stringify(data);
            },
            params: {
                user: '@user',
                app: '@app',
                id: '@id'
            }
        }
    }
    );

}

servicesModule.service('AppsService', ['$q', '$http', '$resource', 'AppSettings', AppsService]);
