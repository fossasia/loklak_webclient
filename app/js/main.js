'use strict';

var angular = require('angular');

require('angular-ui-router');

angular.module('myApp', ['ui.router']);

angular.module('myApp').config(['$stateProvider', '$locationProvider', '$urlRouterProvider', require('./routes')]);

angular.module('myApp').controller('HomeCtrl', require('./controllers/home'));