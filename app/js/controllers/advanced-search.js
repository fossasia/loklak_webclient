'use strict';
/* global angular, L */
/* jshint unused:false */

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, $filter, $location, $stateParams, AppSettings, SearchService, MapPopUpTemplateService, MapCreationService) {

	var vm = this;
	var map = false;
	var prevZoomAction, prevPanAction, newZoomAction, newPanAction;
	
	vm.showLookUp = false;
	vm.isResultShow = false;
	vm.isNumberOfResultShown = false;
	vm.filterMessage = false;
	vm.peopleSearch = false;
	vm.mapSearch = false;
	vm.removeProfane = false;
	vm.currentResult = [];
	vm.resultMessage = "";
	vm.finalParams = {};
	vm.currentFilter = 'live';
	
	if ($stateParams.q === undefined) {
		vm.showAdvancedSearch = true;
	} else {
		vm.showAdvancedSearch = false;
	}

	/*
	 * Location UI component
	 * If user input > 3 chars, suggest location
	 * clicking on suggested location assign value to the according model
	 */
	$scope.chosenLocation = "None chosen";
    $scope.processLookedLocation = function() {
    	if (document.activeElement.className.indexOf("chosen-location") > -1) {
	      if ($scope.chosenLocation && $scope.chosenLocation.length >= 3) {
	      	   SearchService.getLocationSuggestions($scope.chosenLocation).then(function(data) {
	      	   	 vm.hasSuggestions = true;
	      	   	 vm.locationSuggestions = data.queries;
	      	   }, function(e) {
	      	   	vm.hasSuggestions = false;
	      	   	console.log(e);
	      	   });
	      } else {
	      	vm.hasSuggestions = false;
	      }
	    }
    };

    $scope.$watch('chosenLocation', $scope.processLookedLocation);
    vm.setLocation = function(locationTerm) {
    	$scope.chosenLocation = locationTerm;
    	vm.hasSuggestions = false;
    	angular.element(".chosen-location").addClass("chosen");
    };

    vm.toggleShowLookUp = function() {
    	if ($scope.chosenLocation === "None chosen") {
    		$scope.chosenLocation = "";
    	}
    	angular.element(".chosen-location").removeClass("chosen");
    };

	vm.reset = function() {
		$scope.aSearch = {};
		vm.chosenLocation.name = "None chosen";
	};


	/*
	 * Profanity UI component
	 */
	vm.toggleProfanity = function() {
		vm.removeProfane = !vm.removeProfane;
	}

	/** 
	 * Process advanced search options
	 * With given Union params & Intersect params
	 */
	vm.processSearch = function() {
		vm.showAdvancedSearch = false;
		vm.currentResult = {};
		var unionQ = getUnionSearchParams(); 
		var intersectQ = getIntersectSeachParams();
		
		// Currently, there're three cases to process intersect term
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

	/*
	 * Based on processed search params, get search result 
	 */
	vm.getResult = function(Params) {
		if (window.map) { window.map.remove();}
		vm.mapSearch = false;
 		vm.peopleSearch = false;
		vm.currentResult = [];
		SearchService.initData(Params).then(function(data) {
			vm.currentResult = data.statuses;
			processResultLayout(vm.currentResult);
			vm.isResultShow = true;
			if (vm.currentResult.length === 0) {
				console.log("No result from server");
			}
		}, function() {});
	};

	/* 
	 * Empty all field, show a new search
	 */
	vm.initNewSearchView = function() {
		vm.finalParams = {};
		$location.search({
		});
		vm.showAdvancedSearch = true;
		vm.isResultShow = false;
	};

	// Init search if path is a search url
	angular.element(document).ready(function() {
	    if ($stateParams.q !== undefined) {
	    	vm.finalParams.q = $stateParams.q;
	    	vm.getResult(vm.finalParams);
	    	vm.currentFilter = 'live';
	    }
	});

	
	/**
	 * Process union values including 
	 * all of these words/this exact phrase/none of these words/these hashtags/these mention
	 * and time
	 */
	function getUnionSearchParams() {
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
		if (vm.removeProfane) {
			unionTermArray.push("-/profanity");
		}
		if ($scope.chosenLocation && $scope.chosenLocation.name !== "None chosen") {
			unionTermArray.push(getLocationSearchParams($scope.chosenLocation));
		}
		unionTermResult = unionTermArray.join(" ");

		return unionTermResult;
	}

	/**
	 * Process intersect values including 
	 * any of these words/from these accounts
	 * for now support only one parameter each field
	 */
 	function getIntersectSeachParams() {
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
	 * Interchange view based on result
	 */
    function processResultLayout(resultContainer) {
    	if (resultContainer.length === 0) {
    		vm.resultMessage = "No result found";
    		vm.isResultShow = false;
    	} else {
    		vm.resultMessage = "Found " + resultContainer.length + " results!";
    		vm.isResultShow = true;
    	}
    }

	/**
	 * Create search param for location search
	 */
	function getLocationSearchParams(place) {
		if (place === "None chosen" && place === "") {
			return "";
		} else {
			return "near:" + place;	
		}
	}    

	/**
	 * Change stateParams on search
	 */
	function updatePath(query) {
	  $location.search({q: query});
	}


	////////
    //// FILTERS FEATURE
    //// filter fn is used as ng-click trigger
    //// a typical filter trigger will include these operation:
    //// - change current filter model;  - show/hide related result according to filter
    //// - request for new result; - update path based on search term & filter
    //// Filter explanation: live = no filter; accounts = show accounts only; 
    //// photos = tweet with native twitter photo + tweet with recognized photo link
    //// video = tweet with native twitter video + tweet with recognized video link
    //// map = no filter, but results are shown on a map
    ////////
 	vm.filterLive = function() {
 		vm.peopleSearch = false;
 		vm.mapSearch = false;
 		vm.currentFilter = 'live';
 		vm.getResult({q: $location.search().q});
 	};

 	vm.filterPhotos = function() {
 		vm.peopleSearch = false;
 		vm.mapSearch = false;
 		vm.currentFilter = 'photos';
 		console.log(vm.currentFilter);
 		vm.getResult({q: $location.search().q + '+/image'});
 	};

 	vm.filterVideos = function() {
 		vm.peopleSearch = false;
 		vm.mapSearch = false;
 		vm.currentResult = [];
	        vm.currentFilter = 'videos';
	        // Get native videos
	        SearchService.getData({q: $location.search().q + '+/video'}).then(function(data) {
	        	console.log(data);
	            var statuses = data.statuses;
	            statuses.forEach(function(status) {
	                if (status.videos_count) {
	                    if (status.videos[0].substr(-4) === '.mp4') {
	                        status.links[0] = status.videos[0];
	                    }
	                    vm.currentResult.push(status);
	                }
	            });
	            processResultLayout(vm.currentResult); 
	        }, function() {});    
	    };

 	vm.filterAccounts = function() {
 		vm.peopleSearch = true;
 		vm.mapSearch = false;
 		vm.currentFilter = 'accounts';
 		vm.currentResult = [];
 		vm.accounts = [];
 		SearchService.getData({q: $location.search().q}).then(function(data) {
           data.statuses.forEach(function(ele) {
               var notYetInAccounts = true;
               vm.accounts.forEach(function(account) {
                   if (account.screen_name === ele.screen_name) {
                       return notYetInAccounts = false;
                   }
               });
               if (notYetInAccounts) { vm.accounts.push(ele);}
           });
           processResultLayout(vm.accounts); 
       }, function() {});
 	};

 	vm.filterMap = function() {
 		vm.mapSearch = true;
 		vm.peopleSearch = false;
 		vm.currentFilter = "map";
 		vm.currentResult = [];
 		vm.accounts = [];

 		var params = {
 		    q: $location.search().q,
 		    count: 500
 		};

 		SearchService.initData(params).then(function(data) {
 			vm.resultMessage = false;
 		    MapCreationService.initMap({
 		    	data: data.statuses,
 		    	mapId: "advanced-search-map",
 		    	markerType: "simpleCircle",
 		    	templateEngine: "genStaticTwitterStatus",
 		    	cbOnMapAction: addListenersOnMap
 		    }); 
 		}, function() {});
 	};

 	/*
     * Add listener on maps' action 
     * When zoom/pan, new /location bound is calculated, and then is used to get & add more map points
     * prevZoomAction, prevPanAction, newZoomAction, newPanAction are used to prevent event bubbling
     */
    function getMoreLocationOnMapAction() {
        var bound = window.map.getBounds();
        var locationTerm = MapCreationService.getLocationParamFromBound(bound);
        var params = { q: vm.term + "+" + locationTerm, count: 300};
        SearchService.initData(params).then(function(data) {
            MapCreationService.addPointsToMap(window.map, MapCreationService.initMapPoints(data.statuses, "genStaticTwitterStatus"), "simpleCircle", addListenersOnMap);    
        }, function(data) {});
    }

    function addListenersOnMap() {
        window.map.on("zoomend", function(event) {
            if (!prevZoomAction) {
                prevZoomAction = new Date();
                getMoreLocationOnMapAction();
            } else {
                newZoomAction = new Date();
                var interval = (newZoomAction - prevZoomAction);
                if (interval > 1000) {
                    getMoreLocationOnMapAction();
                    prevZoomAction = newZoomAction;        
                }
            }   
        });
        window.map.on("dragend", function(event) {
            if (!prevPanAction) {
                prevPanAction = new Date();
                getMoreLocationOnMapAction();
            } else {
                newPanAction = new Date();
                var interval = (newPanAction - prevPanAction);
                if (interval > 1000) {
                    getMoreLocationOnMapAction();
                    prevPanAction = newPanAction;        
                }
            }
        });
    }
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', '$filter', '$location', '$stateParams', 'AppSettings', 'SearchService', 'MapPopUpTemplateService', 'MapCreationService', AdvancedSearchCtrl
]);