'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function histogramDirective($window) {
    return {
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        link: function($scope, element, attrs) {
            var morris;
            angular.element($window).bind('resize', function() {
                if (morris) {
                    console.log('morris resized');
                    morris.redraw();
                }
            });

            attrs.$observe('value', function(val) {
                if (!morris) {
                	if(val){
                		console.log('creating chart');
                		morris = Morris.Bar({
                		    element: element,
                		    data: angular.fromJson(val),
                		    xkey: $scope[attrs.xkey],
                		    ykeys: $scope[attrs.ykeys],
                		    labels: $scope[attrs.labels]
                		});                		
                	}
                } else {
                    console.log('setting chart values');
                    morris.setData(angular.fromJson(val));
                }
            });
        }

    };

}

directivesModule.directive('barchart', histogramDirective);
