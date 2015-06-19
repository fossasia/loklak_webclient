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
          'title': 'Wall',
          'link' : '/wall',
          'icon' : 'fa fa-list'
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