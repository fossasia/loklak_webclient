'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function wallThumbnailDirective() {

  return {
    scope: {
    	data: '=',
    	deleteWall: '&',
    	editWall: '&'
    },
    replace: true,
    templateUrl: 'wall/templates/wallThumbnail.html',
  };

}

directivesModule.directive('wallthumbnail', wallThumbnailDirective);