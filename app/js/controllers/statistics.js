'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function StatisticsCtrl($scope, $http, AppSettings, StatisticsService) {
  var vm = this;

  vm.update = function(term, sinceDate, untilDate, timeoneOffset) {
  	StatisticsService.getStatistics(term, sinceDate, untilDate, timeoneOffset)
    	.then(function(statistics) {
          $scope.values = []
          $scope.myModel = [];
          $scope.xkey = 'date';
          $scope.ykeys = ['tweetCount'];
          $scope.labels = ['Tweet Count'];
          var i=-1;
          for (var property in statistics.created_at) {
              if (statistics.created_at.hasOwnProperty(property)) {
                  $scope.myModel[++i] = {}
                  $scope.myModel[i].date = property;
                  $scope.myModel[i].tweetCount = statistics.created_at[property];
              }
          }
        },
        function() {
        	console.log('statuses retrieval failed.');
        });
  };
}

controllersModule.controller('StatisticsCtrl', StatisticsCtrl);