'use strict';
/* jshint unused:false */
/* global angular */

/**
 * @ngInject
 */
function OnRun($rootScope, $location, AppSettings, HelloService, AuthService) {
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
		},
		{
			'title': 'Report',
			'link' : '/report',
			'icon' : 'fa fa-bar-chart'
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
        $rootScope.root.currentView = toState.title;
      }
      $rootScope.root.pageTitle = pageTitle;
    });
    $rootScope.root = root;
    
    $rootScope.root.credentials = {
        name : "",
        email : "",
        password : ""
    };
    
    $rootScope.root.onSubmit = function () {
        console.log("s");
        AuthService
        .register($rootScope.root.credentials)
        .error(function(err){
            alert(err);
        })
        .then(function(){
            $location.path('/');
            $rootScope.root.isLoggedIn = AuthService.isLoggedIn();
            $rootScope.root.currentUser = AuthService.currentUser();
        });
    };
    $rootScope.root.onLogout = function () {
        AuthService.logout();
        $location.path('/');
        $rootScope.root.isLoggedIn = AuthService.isLoggedIn();
    };

}

module.exports = OnRun;