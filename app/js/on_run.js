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
  			'link' : '/'
  		},
  		{
  			'title': 'About',
  			'link' : '/about'
  		},
  		{
  			'title': 'Search',
  			'link' : '/search'
  		},
	  ];


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