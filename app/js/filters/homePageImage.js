'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function homePageImageFilter() {

    return function(input) {
        try {
            var splitURL = input.split('_normal');
            return (splitURL[0] + splitURL[1]);
        } catch (err) {
            return 'images/anon_200x200.png';
        }

    }
}

filtersModule.filter('homePageImage', homePageImageFilter);
