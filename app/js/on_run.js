'use strict';

/**
 * @ngInject
 */
function OnRun($rootScope, AppSettings) {

  // change page title based on state
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
    $rootScope.pageTitle = 'Loklak ';

    if ( toState.title ) {
      $rootScope.pageTitle += toState.title;
    }
  });

}

module.exports = OnRun;