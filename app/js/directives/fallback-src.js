'use strict';

var directivesModule = require('./_index.js');

function fallbackSrcDirective(SearchService) {
	return {
		restrict: 'A',
		scope: {
			fallbackStatusId: "="
		},
		link: function(scope, element, attrs) {
			element.bind('error', function() {
				// Use the placeholder img temporarily
				attrs.$set('src', attrs.fallbackSrc);

				/**
				 * When server-side feature is available, modify retrieveImg service
			     * and this function call to select the right data.
				 */
				// SearchService.retrieveImg(scope.fallbackStatusId)
				// 	.then(function(data) {
				// 		attrs.$set('src', data);
				// 	}, 
				// 	function(data) {
				// 		// Do nothing;
				//      // Keep the playholder;
				//	    return;
				// 	});
			});
		}
	};
}


directivesModule.directive('fallbackSrc', ['SearchService', fallbackSrcDirective]);