'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');

function fallbackSrcDirective(SearchService) {
	return {
		restrict: 'A',
		scope: {
			fallbackStatusId: "="
		},
		link: function(scope, element, attrs) {
			scope.errCount = 1;
			element.bind('error', function() {
				// Use the placeholder img temporarily
				attrs.$set('src', attrs.fallbackSrc);

				/**
				 * When server-side feature is available, modify retrieveImg service
			     * and this function call to select the right data.
				 */
				if (scope.errCount === 1) {
					SearchService.retrieveImg(scope.fallbackStatusId).then(function(data) {
						if (data.user && data.user.profile_image_url_https) {
							attrs.$set('src', data.user.profile_image_url_https);
							console.log(data.user.profile_image_url_https);
						}
						scope.errCount += 1;
					}, 
					function(data) {
					    return;
					});	
				}
			});
		}
	};
}


directivesModule.directive('fallbackSrc', ['SearchService', fallbackSrcDirective]);