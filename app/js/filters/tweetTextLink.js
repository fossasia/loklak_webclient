'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

filtersModule.filter('tweetTextLink', function() {
    return function(input) {
        function geturl(url) {
        	url = url.replace(/.*?:\/\//g, "");
            if (url.length > 22) {
                return url.substr(0, 22) + "...";
            } else {
                return url;
            }
        }
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return input.replace(urlRegex, function(url) {
            return '<a href="' + url + '">' + geturl(url) + '</a>';
        })
    };
});
