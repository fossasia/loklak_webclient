'use strict';

/**
 * @ngInject
 */
function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: 'HomeCtrl as home',
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
    title: 'Wall'
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
  .state('Map', {
    url: '/map',
    templateUrl: 'map/tweetmap.html',
    controller: 'MapCtrl as map',
    title: 'Map'
  })
  .state('DataConnect', {
    url: '/myConnections',
    templateUrl: 'data-connect/data-connect.html',
    controller: 'DataConnectCtrl as dataConnect',
    title: 'My Connections'
  })
  .state('DataConnectWSourceType', {
    url: '/myConnections/:source_type',
    templateUrl: 'data-connect/data-connect.html',
    controller: 'DataConnectCtrl as dataConnect',
    title: 'My Connections'
  })
  .state('AddConnection', {
    url: '/addConnection',
    templateUrl: 'data-connect/add-connection.html',
    controller: 'AddConnectionCtrl as addDataConnect',
    title: 'Add connection'
  })
  .state('AddConnectionWSourceType', {
    url: '/addConnection/:source_type',
    templateUrl: 'data-connect/add-connection.html',
    controller: 'AddConnectionCtrl as addConnection',
    title: 'Add connection'
  })
 .state('Analyze', {
    url: '/report',
    templateUrl: 'analyze/analyze.html',
    controller: 'AnalyzeCtrl as Analyze',
    title: 'Analyze Data'
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
  cfpLoadingBarProvider.includeSpinner = false;
}

module.exports = ['$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', 'cfpLoadingBarProvider', Routes];