'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function statDirective() {

  return {
    scope: {
    	data: '=data'
    },
    templateUrl: 'stat.html',
  };

}

directivesModule.directive('stat', statDirective);