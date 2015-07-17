'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("globalSearchForm", ["$rootScope", "$location", "$window", function($rootScope, $location, $window) {


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