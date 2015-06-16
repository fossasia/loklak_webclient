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
    root.topNavItems = [
    		{
    			'title': 'Home',
    			'link' : '/',
          'icon' : 'fa fa-home'
    		},
        {
          'title': 'Wall',
          'link' : '/wall/create',
          'icon' : 'fa fa-list'
        },
        {
          'title': 'Maps',
          'link' : '/map',
          'icon' : 'fa fa-map-marker'
        }
  	  ];

    root.fullscreenDisabled = true;
    root.sidebarEnabled = false;

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      var pageTitle = 'Loklak ';
      if ( toState.title ) {
        pageTitle += toState.title;
      }
      $rootScope.root.pageTitle = pageTitle;
    });
    $rootScope.root = root;
}

module.exports = OnRun;