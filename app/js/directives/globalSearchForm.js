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
			$rootScope.root.lastSearchTimeStamp = new Date();
			$rootScope.root.selectedTermIndex = -1;
			$rootScope.root.searchSuggestions = [];

			/*
	  		 * Watch input from user at global search container
			 */
			$rootScope.$watch(function() {
				return $rootScope.root.globalSearchTerm;
			}, function() {
				if (document.activeElement.id  === "global-search-input" && $rootScope.root.globalSearchTerm.length >=3) {
					SearchService.getSearchSuggestions($rootScope.root.globalSearchTerm).then(function(data) {
						var currentTimeStamp = new Date();
						if ((currentTimeStamp - $rootScope.root.lastSearchTimeStamp) > 1000) {
							$rootScope.root.selectedTermIndex = -1;
							$rootScope.root.searchSuggestions = data.queries;
							$rootScope.root.haveSearchSuggestion = true;	
						}
					}, function() { $rootScope.root.haveSearchSuggestion = false; });
				} else { $rootScope.root.haveSearchSuggestion = false; }
			});

			/*
			 * Stimulate a search click event on search suggestions
			 */
			$rootScope.root.setGlobalSearchTerm = function(term) {
				$rootScope.root.haveSearchSuggestion = false;
				$rootScope.root.lastSearchTimeStamp = new Date();
				$rootScope.root.searchSuggestions = [];
				$rootScope.root.globalSearchTerm = term;
				$rootScope.root.submitSearchForm();
				document.activeElement.blur(); // Stop focusing search box	
			}

			/*
			 * Evaluate current state of search form
			 * Used for related events such as click, enter to submit
			 */
			$rootScope.root.submitSearchForm = function() {
			    if ($rootScope.root.globalSearchTerm && $location.path() !== "/search") {
			        $location.url("/search?q=" + encodeURIComponent($rootScope.root.globalSearchTerm));
			    } else if ($rootScope.root.globalSearchTerm && $location.path() === "/search") {
			    	var q = $rootScope.root.globalSearchTerm;
			    	if ($rootScope.root.globalFilter) {
			    		q = q + "+" + filterToQuery($rootScope.root.globalFilter);	
						$location.url("/search?q=" + encodeURIComponent(q));
			    	} else {
			    		$location.url("/search?q=" + encodeURIComponent(q));
			    	}
			    }
			    $rootScope.root.selectedTermIndex = -1;
			};

			/*
			 * What key input in search box
			 * Up/down arrow will select the suggestions
			 * Enter will eval the value & stimulate a submit
			 */
			$rootScope.root.highlightSelection = function(event) {
				$(".global-search-container .suggestions li").removeClass("active");
			}
			$rootScope.root.watchArrowFromSearchBox = function($event) {
				var code = $event.keyCode;
				var limit = ($rootScope.root.searchSuggestions.length && $rootScope.root.searchSuggestions.length >= 5) ? 4 : ($rootScope.root.searchSuggestions.length - 1);
				if (code === 40) {
					if ($rootScope.root.selectedTermIndex === limit) {
						$rootScope.root.selectedTermIndex = -1;
					} else { $rootScope.root.selectedTermIndex += 1; }

					highlightSelected($rootScope.root.selectedTermIndex);
				}
				if (code === 38) {
					if ($rootScope.root.selectedTermIndex === -1) {
						$rootScope.root.selectedTermIndex = limit;
					} else { $rootScope.root.selectedTermIndex -= 1; }

					highlightSelected($rootScope.root.selectedTermIndex);
				}
				if (code === 13) {
					$event.preventDefault();
					if ($rootScope.root.selectedTermIndex !== -1) {
						$rootScope.root.globalSearchTerm  = $($(".global-search-container .suggestions li")[$rootScope.root.selectedTermIndex]).text().trim();	
					}

					$rootScope.root.setGlobalSearchTerm($rootScope.root.globalSearchTerm );
				}			
			}

			/*
			 * High light selected option on keyEvent
			 */
			function highlightSelected(index) {
				$(".global-search-container .suggestions li").removeClass("active");
				$($(".global-search-container .suggestions li")[index]).addClass("active");
			}
		}
	};
}]);