'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive('time', [ '$timeout', '$filter', function($timeout, $filter) {
  return function(scope, element, attrs) {
    var timeoutId;
    var time = attrs.timecreated;
    var intervalLength = 1000 * 10; //
    var filter = $filter('tweetFromNow');

    function updateTime() {
      element.text(filter(time));
    }

    function updateLater() {
      timeoutId = $timeout(function() {
        updateTime();
        updateLater();
      }, intervalLength);
    }

    element.bind('$destroy', function() {
      $timeout.cancel(timeoutId);
    });

    updateTime();
    updateLater();
  };

}]);