'use strict';
/* jshint unused:false */

/**
 * @ngInject
 */
function OnRun($rootScope, AppSettings, HelloService) {
	var root = {};
  root.hello = HelloService;
  
  /**
   * UI related root variables
   *
   */
    root.globalSearchTerm = '';
    root.topNavItems = [
    		{
    			'title': 'Home',
    			'link' : '/',
          'icon' : 'fa fa-home'
    		},
        {
          'title': 'Map',
          'link' : '/map',
          'icon' : 'fa fa-map-marker text'
        },
        {
          'title': 'Wall',
          'link' : '/wall',
          'icon' : 'fa fa-list'
        },
        {
          'title': 'Connect',
          'link' : '/dataConnect',
          'icon' : 'fa fa-cloud'
        },
        {
          'title': 'Analyze',
          'link' : '/analyze',
          'icon' : 'fa fa-bar-chart'
        }
  	  ];

    root.fullscreenDisabled = true;
    root.sidebarEnabled = false;

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      var pageTitle = 'Loklak ';
      if ( toState.title ) {
        pageTitle += toState.title;
        $rootScope.root.currentView = toState.title;
      }
      $rootScope.root.pageTitle = pageTitle;
    });
    $rootScope.root = root;
}

module.exports = OnRun;