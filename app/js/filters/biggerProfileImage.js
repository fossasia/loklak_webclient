'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function biggerProfileImageFilter() {

    return function(input) {
      var splitURL = input.split('_bigger');
      return (splitURL[0] + splitURL[1]);
    };
}

filtersModule.filter('biggerProfileImage', biggerProfileImageFilter);
