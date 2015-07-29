'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("globalSearchForm", ["$rootScope", "$location", "$window" , "SearchService", function($rootScope, $location, $window, SearchService) {


	function filterToQuery(filterName) {
	    var filtersToQueries = {
	        'photos' : '/image',
	        'videos' :'/video',
	        'accounts' : '/accounts', 
	        'news' : '/news',
	        'map' : '/map'
	    };
	    if (filterName === "live") {
	    	return "";
	    } else {
	    	return filtersToQueries[filterName];	
	    }
	    
	}

	return {
		templateUrl: "global-search-form.html",
		controller: function($scope, $element, $attrs) {
			$rootScope.root.haveSearchSuggestion = false;

			$rootScope.$watch(function() {
				return $rootScope.root.globalSearchTerm;
			}, function() {
				if (document.activeElement.id  === "global-search-input" && $rootScope.root.globalSearchTerm.length >=3) {
					SearchService.getSearchSuggestions($rootScope.root.globalSearchTerm).then(function(data) {
						$rootScope.root.searchSuggestions = data.queries;
						$rootScope.root.haveSearchSuggestion = true;
					}, function() {
						$rootScope.root.haveSearchSuggestion = false;
					});
				} else {
					$rootScope.root.haveSearchSuggestion = false;
				}
			});

			$rootScope.root.setGlobalSearchTerm = function(term) {
				$rootScope.root.globalSearchTerm = term;
				$rootScope.root.submitSearchForm();
				$rootScope.root.searchSuggestions = [];
				$rootScope.root.haveSearchSuggestion = false;
			}

			$rootScope.root.submitSearchForm = function() {
			    if ($rootScope.root.globalSearchTerm && $location.path() !== "/search") {
			        $location.url("/search?q=" + encodeURIComponent($rootScope.root.globalSearchTerm));
			    } else if ($rootScope.root.globalSearchTerm && $location.path() === "/search") {
			    	var q = $rootScope.root.globalSearchTerm;
			    	if ($rootScope.root.globalFilter) {
			    		q = q + "+" + filterToQuery($rootScope.root.globalFilter);	
						$location.url("/search?q=" + encodeURIComponent(q));
						if ($rootScope.root.globalFilter === "map") {
							$window.location.reload();
						}
			    	} else {
			    		$location.url("/search?q=" + encodeURIComponent(q));
			    	}
			    }
			};
		}
	};
}]);