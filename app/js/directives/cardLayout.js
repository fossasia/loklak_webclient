'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive('card', [function() {
	return {
	  scope: {
	  	data: '=',
	  },
	  templateUrl: 'wall/templates/card.html',
	  controller: function($scope) {
	  	$scope.getClass = function () {
	  		if($scope.data.images.length>0){
	  			return 'col-xs-6';
	  		}
	  		else {
	  			if($scope.data.text.length>70) {
	  				return 'col-xs-4';
	  			}
	  			else {
	  				return 'col-xs-3';
	  			}
	  		}
	  	}
	  }
	};
}]);
