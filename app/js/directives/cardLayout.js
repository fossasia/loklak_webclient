'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive('card', ['$timeout', function($timeout) {
    return {
        scope: {
            data: '=',
        },
        templateUrl: 'wall/templates/card.html',
        controller: function($scope) {
            $scope.getClass = function() {
                if ($scope.data.images.length > 0) {
                    return 'col-xs-6';
                } else {
                    if ($scope.data.text.length > 70) {
                        return 'col-xs-4';
                    } else {
                        return 'col-xs-3';
                    }
                }
            }
        },
        link: function(scope, element, attrs) {
            $timeout(function() {
                var i = element.find('.tweet-image');
                if (typeof(i) != 'undefined' && i != null)
                {
                  i.bind("load", function(e) {
                  	if((i.parent().width()-this.clientWidth)!=0)
                  		$(i.parent().parent().children()[1]).css("margin-left",((-1*(i.parent().width()-this.clientWidth))+5).toString() + 'px');
                  });
                }
            });


        }
    };
}]);
