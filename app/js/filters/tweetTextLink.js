'use strict';

var filtersModule = require('./_index.js');
var Autolinker = require('autolinker');
/**
 * @ngInject
 */

filtersModule.filter('tweetTextLink', function() {
    return function(input) {
        if (!input) {
          return "";
        }
        return Autolinker.link(input);
    };
});
