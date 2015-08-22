'use strict';

var controllersModule = require('./_index');


controllersModule.controller('TopologyCtrl', ['$location', '$rootScope', 'HelloService', function($location, $rootScope, HelloService) {
	var vm = this;
	
	angular.element(document).ready(function() {
		vm.pageName = "A User Topology" + $location.search().screen_name;
	})
}]);
