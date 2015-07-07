'use strict';

var directivesModule = require('./_index.js');

directivesModule.directive("globalSearchForm", ["$rootScope", "$location", function($rootScope, $location) {


	function filterToQuery(filterName) {
	    var filtersToQueries = {
	        'photos' : '/image',
	        'videos' :'/video',
	        'accounts' : '/accounts', 
	        'news' : '/news',
	        'map' : '/map'
	    };
	    return filtersToQueries[filterName
	    ];
	}

	return {
		templateUrl: "global-search-form.html",
		controller: function($scope, $element, $attrs) {
			$rootScope.root.submitSearchForm = function() {
			    if ($rootScope.root.globalSearchTerm && $location.path() !== "/search") {
			        $location.url("/search?q=" + encodeURIComponent($rootScope.root.globalSearchTerm));
			    } else if ($rootScope.root.globalSearchTerm && $location.path() === "/search") {
			    	var q = $rootScope.root.globalSearchTerm
			    	if ($rootScope.root.globalFilter) {
			    		console.log($rootScope.root.globalFilter)
			    		q = q + "+" + filterToQuery($rootScope.root.globalFilter);
			    		console.log(q);
						$location.url("/search?q=" + encodeURIComponent(q));
			    	} else {
			    		$location.url("/search?q=" + encodeURIComponent(q));
			    	}
			    }
			}
		}
	};
}]);