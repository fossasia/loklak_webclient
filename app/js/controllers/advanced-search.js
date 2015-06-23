'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, $filter, AppSettings, SearchService) {

	var vm = this;
	
	vm.showLookUp = false;
	vm.currentResult = [];


	/**
	 * Helper fn. Get distance from to location lat & long
	 * compare to given distance
	 
		function deg2rad(deg) {
		  return deg * (Math.PI/180)
		}

		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		  var R = 6371; // Radius of the earth in km
		  var dLat = deg2rad(lat2-lat1);  // deg2rad below
		  var dLon = deg2rad(lon2-lon1); 
		  var a = 
		    Math.sin(dLat/2) * Math.sin(dLat/2) +
		    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		    Math.sin(dLon/2) * Math.sin(dLon/2)
		    ; 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c; // Distance in km
		  return d;
		}
		function isCloseEnoughToChosenLocation(lat1,lon1,lat2,lon2, maxRangeInKm) {
		  var distance = getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2);
		  return distance < maxRangeInKm;
		}
	*/

	/* Location Ui related view model */
		vm.chosenLocation = {name: "None chosen"};
		vm.toggleShowLookUp = function() {
			vm.showLookUp = true;
		}
	    $scope.processLookedLocation = function() {
	      if ($scope.lookedUpLocation) {
	      	vm.chosenLocation = $scope.lookedUpLocation;
	      	console.log($scope.lookedUpLocation);	
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
				unionTermArray.push("since:" + $filter('date')(rawParams.untilDate, 'yyyy-MM-dd'));
			}
			if (vm.chosenLocation && vm.chosenLocation.name !== "None chosen") {
				unionTermArray.push("near:" + encodeURIComponent(vm.chosenLocation.name));
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
	 		var intersectTermArray = [];
	 		var intersectTermResult;
	 		var relatedPropArray = ['accountIntersect', 'intersect'];
	 		var hasInput = false;

	 		relatedPropArray.forEach(function(ele) {
	 			if (rawParams && rawParams[ele]) {
	 				intersectTermArray.push(rawParams[ele].split(" ")[0]);
	 				hasInput = true;
	 			}
	 		});

	 		if (hasInput) {
	 			intersectTermResult = intersectTermArray.join(" ");
	 			return intersectTermResult;	
	 		} else {
	 			return false;
	 		}
	 		
	 	}



	/** 
	 * Process search with given
	 * Union params & Intersect params
	 */
		vm.processSearch = function() {
			var unionQ = getUnionTerm(); // Union related params
			var intersectQ = getIntersectTerm(); // Intersect related params
			var finalParams = {}; // Intersect related params
			
			// Intersect params will overrule union params until further support
			finalParams.q = (intersectQ) ? intersectQ : unionQ;
			vm.getResult(finalParams);
		}

	/* Get search result */
		vm.getResult = function(Params) {
			console.log(Params);
			SearchService.initData(Params).then(function(data) {
				vm.currentResult = data.statuses;
				console.log(vm.currentResult);
			}, function() {});
		}

    
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', '$filter', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);