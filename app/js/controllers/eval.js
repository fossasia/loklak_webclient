'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function EvalCtrl($scope, $http, AppSettings, StatisticsService) {
  var vm = this;

  $scope.hideAtInit = true;

  vm.eval = function(term, sinceDate, untilDate) {
    var d = new Date();
    StatisticsService.getStatistics(term, sinceDate, untilDate, d.getTimezoneOffset())
      .then(function(statistics) {

        // Count no_of_tweets
        var no_of_tweets = 0;
        for (var key in statistics.created_at) { 
          no_of_tweets+=statistics.created_at[key];
        }

        // Map statistics objects into array, e.g. topTweets = [[screen_name_0, no_of_tweets], [screen_name_1, no_of_tweets], ...]
        var sortableTopTweeters  = Object.keys(statistics.screen_name).map(function (key) {
          var num = statistics.screen_name[key];
          var ratio = parseInt((num / no_of_tweets * 100));
          return [key, num, ratio];
        });
        var sortableTopTags  = Object.keys(statistics.hashtags).map(function (key) {
          var num = statistics.hashtags[key];
          var ratio = parseInt((num / no_of_tweets * 100));
          return ['#' + key, num, ratio];
        });
        var sortableToptopMentions  = Object.keys(statistics.mentions).map(function (key) {
          var num = statistics.mentions[key];
          var ratio = parseInt((num / no_of_tweets * 100));
          return ['@' + key, num, ratio];
        });

        $scope.hideAtInit = false;
        $scope.topTags = sortableTopTags.sort(function(a,b) { return b[1] - a[1] });
        $scope.topTweeters = sortableTopTweeters.sort(function(a,b) { return b[1] - a[1] });
        $scope.topMentions = sortableToptopMentions.sort(function(a,b) { return b[1] - a[1] });
      },
      function() {
        console.log('statuses retrieval failed.');
      });
  };
}

controllersModule.controller('EvalCtrl', EvalCtrl);