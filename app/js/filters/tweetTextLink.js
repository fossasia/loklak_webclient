'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

filtersModule.filter('tweetTextLink', function() {
    return function(input) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return input.replace(urlRegex, function(url) {
            var changedUrl = url.replace(/.*?:\/\//g, "");
            if( changedUrl.length > 22) {
                return '<a class=\'external_link\' href=\'' + url + '\' target=\'_blank\'>' + changedUrl.substr(0,22) + '...' + '</a>';
            }
            else {
                return "<a class='external_link' href='" + url + "' target='_blank'>" + changedUrl + "</a>";
            }
        })
    };
});
