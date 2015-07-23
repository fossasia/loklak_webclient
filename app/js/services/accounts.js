'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function AccountsService($q, $http, $resource, AppSettings) {

    var service = {};
    var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];
    // service.updateData = function(obj) {
    //     var deferred = $q.defer();
    //     var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];
    //     console.log(url);
    //     $http.jsonp(url + '/updateData?callback=JSON_CALLBACK', {
    //         params: {
    //             data: obj
    //         }
    //     }).success(function(data) {
    //         deferred.resolve(data);
    //     }).error(function(err, status) {
    //         deferred.reject(err, status);
    //     });

    //     return deferred.promise;
    // };

    // service.getData = function(obj) {
    //     var deferred = $q.defer();
    //     var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];
    //     $http.jsonp(url + '/getData?callback=JSON_CALLBACK', {
    //         params: {
    //             screen_name: obj
    //         }
    //     }).success(function(data) {
    //         deferred.resolve(data);
    //     }).error(function(err, status) {
    //         deferred.reject(err, status);
    //     });

    //     return deferred.promise;
    // };

    //return service;

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

servicesModule.service('AccountsService', ['$q', '$http', '$resource', 'AppSettings', AccountsService]);
