'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function removeTwitterPicLinkFilter() {
  
  return function(input) {
    console.log("Foo");
    var twitterLinkRegex = /(https:\/\/pic\.twitter\.com[\S]+)/gi;
    return input.replace(twitterLinkRegex, '');    
  };
  
}


filtersModule.filter('removeTwitterPicLink', removeTwitterPicLinkFilter);