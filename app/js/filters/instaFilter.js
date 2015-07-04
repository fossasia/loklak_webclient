'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function instaFilter() {

    return function(input) {
        if (input) {
            if (input.indexOf('instagram.com/') > 0)
                return (input + 'media');
            else
                return input;
        }
        else
        	return input;

    }
}
filtersModule.filter('instaFilter', instaFilter);