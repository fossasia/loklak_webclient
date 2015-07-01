'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function biggerProfileImageFilter() {

    return function(input) {
        try {
            var splitURL = input.split('_bigger');
            return (splitURL[0] + splitURL[1]);
        } catch (err) {
            return 'images/anon_200x200.png';
        }

    }
}
filtersModule.filter('biggerProfileImage', biggerProfileImageFilter);
