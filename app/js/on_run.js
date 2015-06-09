'use strict';
/* jshint unused:false */

/**
 * @ngInject
 */
function OnRun($rootScope, AppSettings) {
	var root = {};
  
  // Top nav items 
  root.topNavItems = [
  		{
  			'title': 'Home',
  			'link' : '/',
        'icon' : 'home'
  		},
  		{
  			'title': 'About',
  			'link' : '/about',
        'icon' : 'info-circle'
  		},
  		{
  			'title': 'Search',
  			'link' : '/search',
        'icon' : 'search'
  		},
      {
        'title': 'Wall',
        'link' : '/wall/create',
        'icon' : 'tasks'
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