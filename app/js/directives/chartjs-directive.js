'use strict';

angular.module('chartjs-directive', []).
  directive('chart', function () {
    var baseWidth = 600;
    var baseHeight = 400;

    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      scope: {
        chartObject: "=value"
      },
      link: function (scope, element, attrs) {
        var canvas  = element.find('canvas')[0];
        var context = canvas.getContext('2d');
        var chart;

        var options = {
          type:   attrs.type   || "Line",
          width:  attrs.width  || baseWidth,
          height: attrs.height || baseHeight
        };
        canvas.width = options.width;
        canvas.height = options.height;
        chart = new Chart(context);

        scope.$watch(function(){ return element.attr('type'); }, function(value){
          if (!value) return;
          options.type = value;
          var chartType = options.type;
          chart[chartType](scope.chartObject.data, scope.chartObject.options);
        });

        //Update when charts data changes
        scope.$watch(function() { return scope.chartObject; }, function(value) {
          if (!value) return;
          var chartType = options.type;
          chart[chartType](scope.chartObject.data, scope.chartObject.options);
          if (scope.chartInstance) scope.chartInstance.destroy();
          scope.chartInstance = chart[chartType](scope.chartObject.data, scope.chartObject.options);
        }, true);
      }
    }
  });