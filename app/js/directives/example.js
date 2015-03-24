'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function exampleDirective() {

  return {
    restrict: 'EA',
    link: function(scope, element) {
      element.on('click', function() {
        console.log('element clicked');
      });
    }
  };

}

directivesModule.directive('exampleDirective', exampleDirective);