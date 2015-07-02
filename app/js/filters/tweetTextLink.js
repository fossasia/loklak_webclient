'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

filtersModule.filter('tweetTextLink', function() {
    return function(input) {
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        var split = input.split(" ");
        for (var i = 0; i < split.length; i++) {
            if (split[i].match(regex)) {
                var text = split[i].split(".").slice(1).join(".").split("/")[0];

                split[i] = '<a href=\"' + split[i] + '\">' + text + '...</a>';
            }
        }
        return split.join(" ");
    };
});
