'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function wallThumbnailDirective() {

  return {
    scope: {
    	data: '=',
    },
    replace: true,
    templateUrl: 'wall/templates/wallThumbnail.html',
  };

}

directivesModule.directive('wallthumbnail', wallThumbnailDirective);