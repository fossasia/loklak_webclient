'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, AppSettings, SearchService) {

	var vm = this;
	vm.chosenLocation = "None chosen";
	vm.showLookUp = false;
	vm.toggleShowLookUp = function() {
		console.log("Foo");
		vm.showLookUp = true;
	}
    $scope.processLookedLocation = function() {
      if ($scope.lookedUpLocation) {
      	vm.chosenLocation = $scope.lookedUpLocation.name;
      	console.log($scope.lookedUpLocation);	
      	vm.showLookUp = false;
      }
      
    };
    $scope.$watch('lookedUpLocation', $scope.processLookedLocation);

    
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);