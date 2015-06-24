'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, $filter, $location, $stateParams, AppSettings, SearchService) {

	var vm = this;
	
	vm.showLookUp = false;
	vm.currentResult = [];
	vm.isResultShow = false;
	vm.isNumberOfResultShown = false;
	vm.resultMessage = "";
	vm.finalParams = {};
	if ($stateParams.q === undefined) {
		vm.showAdvancedSearch = true;
	} else {
		vm.showAdvancedSearch = false;
	}
	$scope.lookedUpLocationRadius = 500;


	/* Location Ui related view model */
		vm.chosenLocation = {name: "None chosen"};
		vm.toggleShowLookUp = function() {
			vm.showLookUp = true;
		}
	    $scope.processLookedLocation = function() {
	      if ($scope.lookedUpLocation) {
	      	vm.chosenLocation = $scope.lookedUpLocation;
	      	console.log(vm.chosenLocation);
	      	vm.showLookUp = false;
	      }
	      
	    };
	    $scope.$watch('lookedUpLocation', $scope.processLookedLocation);
	/* End location ui related view model */

	/* Reset button */
		vm.reset = function() {
			$scope.aSearch = {};
			vm.chosenLocation.name = "None chosen";
		}

	/** 
	 * Process search with given
	 * Union params & Intersect params
	 */
		vm.processSearch = function() {
			vm.showAdvancedSearch = false;
			vm.currentResult = {};
			var unionQ = getUnionTerm(); // Union related params
			var intersectQ = getIntersectTerm(); // Intersect related params
			
			// There are currently three cases to process intersect term
			// If it's an OR, like loklak OR food, use this & overrule the rest
			// If it's an from:screen_name, append this to union search
			// It it's only one word, also append this to union search
			// If empty use union
			if (intersectQ) {
				if (intersectQ.indexOf("OR") > -1) {
					vm.finalParams.q = intersectQ;
				} else {
					vm.finalParams.q = unionQ + " " + intersectQ;
				}
			} else {
				vm.finalParams.q = unionQ;
			}

			vm.getResult(vm.finalParams);
			updatePath(vm.finalParams.q);
		};

	/* Get search result */
		vm.getResult = function(Params) {
			console.log(Params);
			SearchService.initData(Params).then(function(data) {
				vm.currentResult = data.statuses;
				processResultLayout();
				vm.isResultShow = true;
				if (vm.currentResult.length === 0) {
					console.log("No result from data");
				}
			}, function() {
				console.log("No result");
			});
		};

	/* Do a new search */
		vm.initNewSearchView = function() {
			vm.finalParams = {};
			$location.search({
			});
			vm.showAdvancedSearch = true;
			vm.isResultShow = false;
		}

	// Init statuses if path is a search url
	angular.element(document).ready(function() {
	    if ($stateParams.q !== undefined) {
	    	vm.finalParams.q = $stateParams.q;
	    	vm.getResult(vm.finalParams);
	    }
	});

	
	/**
	 * Process union values including 
	 * all of these words/this exact phrase/none of these words/these hashtags/these mention
	 * and time
	 */
		function getUnionTerm() {
			var rawParams = $scope.aSearch;
			var unionTermArray = [];
			var unionTermResult;
			var relatedPropArray = ['union', 'phrase', 'negUnion', 'hashtags', 'accountMentionUnion'];

			relatedPropArray.forEach(function(ele) {
				if (rawParams && rawParams[ele]) {
					unionTermArray.push(rawParams[ele]);
				}
			});

			if (rawParams && rawParams.sinceDate) {
				unionTermArray.push("since:" + $filter('date')(rawParams.sinceDate, 'yyyy-MM-dd'));
			}
			if (rawParams && rawParams.untilDate) {
				unionTermArray.push("until:" + $filter('date')(rawParams.untilDate, 'yyyy-MM-dd'));
			}
			if (vm.chosenLocation && vm.chosenLocation.name !== "None chosen") {
				unionTermArray.push(getLocationSearchParams(vm.chosenLocation, $scope.lookedUpLocationRadius));
			}
			
			unionTermResult = unionTermArray.join(" ");
			return unionTermResult;
		}

	/**
	 * Process intersect values including 
	 * any of these words/from these accounts
	 * for now support only one parameter each field
	 */
	 	function getIntersectTerm() {
	 		var rawParams = $scope.aSearch;
	 		var intersectTermResult;
	 		var hasInput = false;

 			if (rawParams && rawParams.intersect) {
 				hasInput = true;
 				var words = rawParams.intersect.split(" ");
 				if (words.length === 1) {
 					intersectTermResult = words[0];
 				} else {
 					intersectTermResult = words[0] + " OR " + words[1];
 				}
 			}

 			if (rawParams && rawParams.accountIntersect) {
 				hasInput = true;
 				intersectTermResult = "from:" + rawParams.accountIntersect.split(" ")[0];
 			}


	 		if (hasInput) {
	 			return intersectTermResult;	
	 		} else {
	 			return "";
	 		} 		
	 	}


	/**
	 * Process result related view
	 */
	    function processResultLayout() {
	    	if (vm.currentResult.length === 0) {
	    		vm.resultMessage = "No result found";
	    		vm.isResultShow = false;
	    	} else {
	    		vm.resultMessage = "Found " + vm.currentResult.length + " results!";
	    		vm.isResultShow = true;
	    	}
	    }

	/**
	 * Calculate location for search params
	 */
		function getLocationSearchParams(point, radius) {
			var orgLat = point.latitude;
			var orgLong = point.longitude;
			var offsetLat = (radius / 2) / 110.574;
			var offsetLong = Math.abs((radius / 2) / (111.320*(Math.cos(offsetLat))));

			var longWest = parseInt(orgLong - offsetLong);
			var latSouth = parseInt(orgLat - offsetLat);
			var longEast = parseInt(orgLong + offsetLong);
			var latNorth = parseInt(orgLat + offsetLat);

			return "/location=" + longWest + "," + latSouth + "," + longEast + "," + latNorth; 
		}
	/**
	 * Change stateParams on search
	 */
		function updatePath(query) {
		  $location.search({
		    q: query
		  });
		}
    
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', '$filter', '$location', '$stateParams', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);