'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, AppSettings, SearchService) {

	var vm = this;
	
	vm.showLookUp = false;
	vm.currentResult = [];


	/* Location Ui related view model */
		vm.chosenLocation = "None chosen";
		vm.toggleShowLookUp = function() {
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
	/* End location ui related view model */

	/* Reset button */
		vm.reset = function() {
			$scope.aSearch = {};
			vm.chosenLocation = "None chosen";
		}


	/** 
	 * Process parameters, query and return results 
	 * Params contained in $scope.aSearch
	 * vm.chosenlocation
	 * 
	 */
		vm.processSearch = function() {
			var rawParams = $scope.aSearch;

			// Process combination of term, type union
				var unionTermArray = [];
				if (rawParams.union) {
					unionTermArray.push(rawParams.union);
				}	 
				if (rawParams.accountMentionIntersect) {
					unionTermArray.push(rawParams.accountMentionIntersect);
				}
				if (rawParams.hashtags)  {
					unionTermArray.push(rawParams.hashtags);
				}
				var unionTerm = unionTermArray.join(" ");




			// Get result
			var finalParams = {
				q: unionTerm
			}
			vm.getResult(finalParams);
		}

	/* Get search result */
	vm.getResult = function(Params) {
		SearchService.initData(Params).then(function(data) {
			vm.currentResult = data.statuses;
			console.log(vm.currentResult);
		}, function() {});
	}

    
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);