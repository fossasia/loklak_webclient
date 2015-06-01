'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
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
    url: '/wall',
    templateUrl: 'wall/landing.html',
    controller: 'WallCtrl as wall',
    title: 'Wall'
  })
  .state('WallCreate', {
    url: '/wall/create',
    templateUrl: 'wall/create.html',
    controller: 'WallCtrl as wall',
    title: 'Wall'
  })
  .state('WallDisplay', {
    url: '/wall/display',
    templateUrl: 'wall/display.html',
    controller: 'WallDisplay as wall',
    title: 'Wall',
    onEnter: function($rootScope){$rootScope.root.fullscreenDisabled=false;},
    onExit: function($rootScope){$rootScope.root.fullscreenDisabled=true;}
  })
  .state('Statistics', {
    url: '/statistics?q&since&until',
    controller: 'StatisticsCtrl as statistics',
    templateUrl: 'statistics.html',
    title: 'Statistics'
  });

  $urlRouterProvider.otherwise('/');

  cfpLoadingBarProvider.includeBar = false;
}

module.exports = Routes;