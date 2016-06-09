'use strict';

var servicesModule = require('./_index.js');
/**
 * @ngInject
 */
function MailerService($http) {
    
    var sendConfirmation = function(email) {
        $http.get('api/send', {params: {to: email}});
    };
    
    return {
        sendConfirmation: sendConfirmation
    };
}

servicesModule.service('MailService',['$http', MailerService]);

