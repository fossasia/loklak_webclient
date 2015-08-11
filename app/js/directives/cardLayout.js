'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function cardLayout() {

  return {
    scope: {
    	data: '=',
    },
    templateUrl: 'wall/templates/card.html',
  };

}

directivesModule.directive('card', cardLayout);