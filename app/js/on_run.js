'use strict';
/* jshint unused:false */
/* global angular */

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
          'title': 'Report',
          'link' : '/report',
          'icon' : 'fa fa-bar-chart'
        },
        {
          'title': 'Wall',
          'link' : '/wall',
          'icon' : 'fa fa-list'
        },
        {
          'title': 'Connect',
          'link' : '/connect',
          'icon' : 'fa fa-cloud'
        }
        
  	  ];

    root.fullscreenDisabled = true;
    root.sidebarEnabled = false;


    $rootScope.$on('cfpLoadingBar:started', function() {
      angular.element('#loklak-nav-logo').hide();
    });

    $rootScope.$on('cfpLoadingBar:completed', function() {
      angular.element('#loklak-nav-logo').show();
    });

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      var pageTitle = 'Loklak ';
      if ( toState.title ) {
        pageTitle += toState.title;
      }
      $rootScope.root.pageTitle = pageTitle;

      if (toState.currentView) {
        $rootScope.root.currentView = toState.currentView;
      }
    });
    $rootScope.root = root;
}

module.exports = OnRun;