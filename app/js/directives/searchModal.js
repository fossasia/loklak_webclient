'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function searchModalDirective() {

  return {
    scope: {
    	modalData: '=',
    	switchToSwipe: '=',
    	tweetModalShow: '=',
    },
    templateUrl: 'search-modal.html',
  };

}

directivesModule.directive('searchModal', searchModalDirective);