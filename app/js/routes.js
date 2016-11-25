'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: 'MapCtrl as map',
    templateUrl: 'home.html',
    title: 'Home',
    currentView: 'Home'
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
  .state('Advanced', {
    url: '/advancedsearch?q',
    templateUrl: 'advancedsearch.html',
    controller: 'AdvancedSearchCtrl as advanced',
    title: 'AdvancedSearch',
    reloadOnSearch: false
  })
  .state('Wall', {
    url: '/wall',
    templateUrl: 'wall/create.html',
    controller: 'WallCtrl as wall',
    title: 'Wall',
    currentView: 'Wall'
  })
  // .state('WallCreate', {
  //   url: '/wall/create',
  //   templateUrl: 'wall/create.html',
  //   controller: 'WallCtrl as wall',
  //   title: 'Wall'
  // })
  .state('WallDisplay', {
    url: '/:user/wall/:id',
    templateUrl: 'wall/display.html',
    controller: 'WallDisplay as wall',
    title: 'Wall',
    onEnter: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=false;}],
    onExit: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=true;}]
  })
  .state('Statistics', {
    url: '/statistics?q&since&until',
    controller: 'StatisticsCtrl as statistics',
    templateUrl: 'statistics.html',
    title: 'Statistics'
  })
  .state('SingleTweet', {
    url: '/tweet?q',
    controller: 'SingleTweetCtrl as singleTweet',
    templateUrl: 'single-tweet.html',
    title: 'SingleTweet'
  })
  .state('Topology', {
    url: '/topology?screen_name',
    templateUrl: 'topology.html',
    controller: 'TopologyCtrl as topology',
    title: 'Topology'
  })
  .state('DataConnect', {
    url: '/connect',
    templateUrl: 'data-connect/data-connect.html',
    controller: 'DataConnectCtrl as dataConnect',
    title: 'My Connections',
    currentView: 'Connect'
  })
  .state('DataConnectWSourceType', {
    url: '/connect/:source_type',
    templateUrl: 'data-connect/data-connect.html',
    controller: 'DataConnectCtrl as dataConnect',
    title: 'My Connections'
  })
 .state('Analyze', {
    url: '/report',
    templateUrl: 'analyze/analyze.html',
    controller: 'AnalyzeCtrl as Analyze',
    title: 'Analyze Data',
    currentView: 'Report'
  })
  .state('Redirecting', {
    url: '/redirect',
    templateUrl: 'redirect.html',
    title: 'Redirecting',
    onEnter: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=false;}],
    onExit: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=true;}]
  });

  $urlRouterProvider.otherwise('/');

  cfpLoadingBarProvider.includeBar = false;
  cfpLoadingBarProvider.includeSpinner = true;

  //token injector http interceptor
  $httpProvider.interceptors.push('tokenInjector'); 

}

module.exports = ['$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', 'cfpLoadingBarProvider', Routes];