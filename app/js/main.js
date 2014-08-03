'use strict';

var angular = require('angular');

require('angular-ui-router');

var app = angular.module('myApp', ['ui.router']);

app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', require('./routes')])
.controller('HomeCtrl', require('./controllers/home'));