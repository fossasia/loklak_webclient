require('angular');
require('angular-ui-router');

require('./controllers/index.js');

var app = angular.module('myApp', [
            'ui.router',

            'app.controllers'
          ]).config(['$routeProvider', '$locationProvider', '$urlRouterProvider', require('./routes.js')]);

angular.bootstrap(document, ['myApp']);