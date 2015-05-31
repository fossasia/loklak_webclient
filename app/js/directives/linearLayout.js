'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearLayoutDirective() {

  return {
    scope: {
    	data: '=',
    	highlight: '=',
    	open: '=',
    	openTweet: '=',
    },
    templateUrl: 'wall/templates/linear.html',
  };

}

directivesModule.directive('linear', linearLayoutDirective);