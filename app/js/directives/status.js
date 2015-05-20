'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function statusDirective() {

  return {
    scope: {
    	data: '=',
    	highlight: '=',
    	open: '='
    },
    templateUrl: 'status.html',
  };

}

directivesModule.directive('status', statusDirective);