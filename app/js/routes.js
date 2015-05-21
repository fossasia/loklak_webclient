'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $authProvider, cfpLoadingBarProvider) {
  $authProvider.twitter({
    url: '/auth/twitter'
  });

  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: '',
    templateUrl: 'home.html',
    title: 'Home'
  })
  .state('About', {
    url: '/about',
    templateUrl: 'about.html',
    title: 'About Loklak Twitter Evaluation'
  })
  .state('Search', {
    url: '/search?q&timezoneOffset',
    templateUrl: 'search.html',
    controller: 'SearchCtrl as search',
    title: 'Search',
    reloadOnSearch: false
  })
  .state('Wall', {
    url: '/wall?q',
    templateUrl: 'wall.html',
    controller: 'WallCtrl as wall',
    title: 'Wall'
  })
  .state('Statistics', {
    url: '/statistics?q&since&until',
    controller: 'StatisticsCtrl as statistics',
    templateUrl: 'statistics.html',
    title: 'Statistics'
  })
  .state('Login', {
    url: '/login',
    controller: 'LoginCtrl as login',
    templateUrl: 'login.html',
    title: 'Login'
  });

  $urlRouterProvider.otherwise('/');

  cfpLoadingBarProvider.includeBar = false;
}

module.exports = Routes;