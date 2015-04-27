'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: 'SearchCtrl as search',
    templateUrl: 'search.html',
    title: 'Search'
  });

  $urlRouterProvider.otherwise('/');

}

module.exports = Routes;