'use strict';

module.exports = function($stateProvider, $locationProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: 'HomeCtrl as home',
    templateUrl: 'views/home.html'
  });

  $urlRouterProvider.otherwise('/');

};