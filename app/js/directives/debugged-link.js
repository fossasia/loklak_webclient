'use strict';

var directivesModule = require('./_index.js');

function debuggedLinkDirective(SearchService, $filter) {
	return {
		restrict: 'A',
		scope: {
			linkContainer: "="
		},
		controller: function($scope) {
			$scope.debuggable = false;
		},
		templateUrl: 'debugged-link.html',
		link: function(scope, element, attrs) {
			var tweetTextLink = $filter('tweetTextLink');
			console.log(tweetTextLink);
			var text = scope.linkContainer;
			// Extract link for text with tweetTextLink filter
			var undebuggedLink = tweetTextLink(text);
			console.log(undebuggedLink);
			// Get embeded tag from embedly link debugger
			SearchService.debugLink(undebuggedLink)
			.then(function(data) {
				scope.debuggable = true;
				scope.debuggedContent = data;
				console.log(data);
			}, function(data) {
				// Debugging failed
				console.log(data);
			});
		}
	};
}


directivesModule.directive('debuggedLink', debuggedLinkDirective);