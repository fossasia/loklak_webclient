'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, $scope, $filter, $location, $stateParams, AppSettings, SearchService, MapPopUpTemplateService) {

	var vm = this;
	var map = false;
	
	vm.showLookUp = false;
	vm.currentResult = [];
	vm.isResultShow = false;
	vm.isNumberOfResultShown = false;
	vm.resultMessage = "";
	vm.finalParams = {};
	vm.filterMessage = false;
	vm.currentFilter = 'live';
	vm.peopleSearch = false;
	vm.mapSearch = false;
	if ($stateParams.q === undefined) {
		vm.showAdvancedSearch = true;
	} else {
		vm.showAdvancedSearch = false;
	}
	$scope.lookedUpLocationRadius = 500;


	/* Location Ui related view model */
		$scope.chosenLocation = "None chosen";
	    $scope.processLookedLocation = function() {
	    	if (document.activeElement.className.indexOf("chosen-location") > -1) {
		      if ($scope.chosenLocation && $scope.chosenLocation.length >= 3) {
		      	   SearchService.getLocationSuggestions($scope.chosenLocation).then(function(data) {
		      	   	 vm.hasSuggestions = true;
		      	   	 vm.locationSuggestions = data.queries;
		      	   	 console.log(vm.locationSuggestions);
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
	    	angular.element(".chosen-location").removeClass("chosen");
	    };
	/* End location ui related view model */

	/* Reset button */
		vm.reset = function() {
			$scope.aSearch = {};
			vm.chosenLocation.name = "None chosen";
		};

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
			destroyMap();
			vm.mapSearch = false;
     		vm.peopleSearch = false;
			vm.currentResult = [];
			console.log(Params);
			SearchService.initData(Params).then(function(data) {
				vm.currentResult = data.statuses;
				processResultLayout(vm.currentResult);
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
	    	vm.currentFilter = 'live';
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


	/* Filters */
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
     		    initMap(data.statuses);    
     		}, function() {});
     	};

     	// Init map
     	function initMap(data) {
     	    map = L.map('advanced-search-map').setView(new L.LatLng(5.3,-4.9), 2);
     	    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
     	        maxZoom: 18,
     	        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
     	            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
     	            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
     	        id: 'examples.map-20v6611k'
     	    }).addTo(map);

     	    var tweets = {
     	        "type": "FeatureCollection",
     	        "features": [
     	        ]
     	    };
     	    data.forEach(function(ele) {
     	        if (ele.location_mark) {
     	            var text = MapPopUpTemplateService.genStaticTwitterStatus(ele);
     	            var pointObject = {
     	                "geometry": {
     	                    "type": "Point",
     	                    "coordinates": [
     	                        ele.location_mark[0],
     	                        ele.location_mark[1]
     	                    ]
     	                },
     	                "type": "Feature",
     	                "properties": {
     	                    "popupContent": text
     	                },
     	                "id": ele.id_str
     	            };
     	            tweets.features.push(pointObject);
     	        }
     	    });

     	    function onEachFeature(feature, layer) {
     	        
     	        if (feature.properties && feature.properties.popupContent) {
     	            var popupContent = feature.properties.popupContent;
     	        }

     	        layer.bindPopup(popupContent);
     	    }

     	    L.geoJson([tweets], {

     	        style: function (feature) {
     	            return feature.properties && feature.properties.style;
     	        },

     	        onEachFeature: onEachFeature,

     	        pointToLayer: function (feature, latlng) {
     	            return L.circleMarker(latlng, {
     	                radius: 8,
     	                fillColor: "#ff7800",
     	                color: "#000",
     	                weight: 1,
     	                opacity: 1,
     	                fillOpacity: 0.8
     	            });
     	        }
     	    }).addTo(map);    
     	};

     	function destroyMap() {
     		if (map) {
     			map.remove();	
     		}
     	}
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', '$scope', '$filter', '$location', '$stateParams', 'AppSettings', 'SearchService', 'MapPopUpTemplateService', AdvancedSearchCtrl
]);