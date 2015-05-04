'use strict';

var controllersModule = require('./_index');
var moment = require('moment');
/**
 * @ngInject
 */
function StatisticsCtrl($location, $stateParams, $scope, $http, AppSettings, StatisticsService) {
    
    function updateHistogram(term, sinceDate, untilDate){     
      StatisticsService.getStatistics(term, sinceDate, untilDate)
          .then(function(statistics) {
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
                      $scope.shareLink = AppSettings.domain + '/statistics?q=' + term + '&since=' + sinceDate + '&until=' + untilDate; 
                  } 
                  else {
                      $scope.statusText = 'No tweets found in this time range! Please search for a different term or select a different time range.';
                      $scope.isValid = false;
                      $scope.myModel = [];
                  }
              },
              function() {
                $scope.isValid = false;
                console.log('statuses retrieval failed.');
              });      
    }

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

    var vm = this;
    vm.update = function(term, sinceDate, untilDate) {
      sinceDate=moment(sinceDate).format('YYYY-MM-DD_HH:mm');
      untilDate=moment(untilDate).format('YYYY-MM-DD_HH:mm'); 
      updateHistogram(term, sinceDate, untilDate);
    };
}

controllersModule.controller('StatisticsCtrl', StatisticsCtrl);
