'use strict';

var controllersModule = require('./_index');
var moment = require('moment');
/**
 * @ngInject
 */
function StatisticsCtrl($location, $stateParams, $scope, $http, AppSettings, StatisticsService) {
    
    
    /*
     * Eval stats and histogram from the result
     * Inject necessarily scope vars
     */
    function evalStats(statistics) {
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
    	console.log($scope.topTags);
    }

    function evalHistogram(statistics) {
    	if (!(Object.getOwnPropertyNames(statistics.created_at).length === 0)) {
    	    $scope.statusText = '';
    	    $scope.isValid = true;
    	    $scope.myModel = [];
    	    $scope.xkey = 'date';
    	    $scope.ykeys = ['tweetCount'];
    	    $scope.labels = ['Tweet Count'];
    	    var i = -1;
    	    for (var property in statistics.created_at) {
    	        if (statistics.created_at.hasOwnProperty(property)) {
    	            $scope.myModel[++i] = {};
    	            $scope.myModel[i].date = property;
    	            $scope.myModel[i].tweetCount = statistics.created_at[property];
    	        }
    	    }
    	} 
    	else {
    	    $scope.statusText = 'No tweets found in this time range! Please search for a different term or select a different time range.';
    	    $scope.isValid = false;
    	    $scope.myModel = [];
    	}
    }

    /* 
     * Request with given params
     * Return statistics to evaluate
     */
    function updateAll(term, sinceDate, untilDate){     
    	var d = new Date();
    	$scope.shareLink = AppSettings.domain + '/statistics?q=' + term + '&since=' + sinceDate + '&until=' + untilDate; 
      StatisticsService.getStatistics(term, sinceDate, untilDate, d.getTimezoneOffset())
          .then(function(statistics) {
                  evalStats(statistics);
                  evalHistogram(statistics);
			          },
			          function() {
			            $scope.isValid = false;
			            console.log('statuses retrieval failed.');
			          }
	        );      
    }

    // Hide histogram, stats at init
    if (!((typeof $stateParams.q === "undefined")||(typeof $stateParams.since === "undefined")||(typeof $stateParams.until === "undefined"))) {
      $scope.isValid = false;
      try{
        var sinceDate=new Date($stateParams.since.replace('_', ' '));
        var untilDate=new Date($stateParams.until.replace('_', ' '));
        $scope.term = $stateParams.q;
        $scope.sinceDate = sinceDate;
        $scope.untilDate = untilDate;
        updateHistogram($stateParams.q, $stateParams.since, $stateParams.until);
      }
      catch(err){
        console.log("Invalid query parameters." + err);
        $scope.statusText = 'No tweets found in this time range! Please search for a different term or select a different time range.';
        $scope.isValid = false;
        $scope.myModel = [];
      }
    }
    else{
      $scope.isValid = false;
    }
    $scope.hideAtInit = true;
   
    var vm = this;

    // On search trigger updating historgram and stats
    vm.update = function(term, sinceDate, untilDate) {
      sinceDate=moment(sinceDate).format('YYYY-MM-DD_HH:mm');
      untilDate=moment(untilDate).format('YYYY-MM-DD_HH:mm');
      updateAll(term, sinceDate, untilDate);
    };

}

controllersModule.controller('StatisticsCtrl', StatisticsCtrl);
