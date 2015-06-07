/*Summarize the:

x Choose only the first link of status.links to debug. The rest are images.
x Create a directive to contain debugged link
x In the new directive recipe, pass in the chosen link to a SearchService method
x Meanwhile, create a service in SearchService to debug the link
API for debugging: http://gofullstack.me:8061/oembed?url=:URL_HERE
Successful debugging should result embedding tags
x Process type
Else, it's a video. Create a container for it and interpolate the whole thing.
When done, implement (or get help) locally the oembed server.

Also filter the tweet-content-text to remove the link when success
*/


'use strict';

var directivesModule = require('./_index.js');

function debuggedLinkDirective(DebugLinkService) {
	return {
		restrict: 'A',
		scope: {
			linkArray: "=",
		},
		controller: function($scope) {
			$scope.debuggable = false;
			$scope.debuggedContent = "foo";
		},
		templateUrl: 'debugged-link.html',
		link: function(scope, element, attrs) {	
			var undebuggedLink = scope.linkArray[0];
			if (undebuggedLink && undebuggedLink.indexOf("pic.twitter.com") === -1) {
				console.log(undebuggedLink);

				// Use iFramely if instagram
				if (undebuggedLink.indexOf("instagram.com") > -1) {
					DebugLinkService.debugLink(undebuggedLink)
					.then(function(data) {
						console.log(data);
						if (data !== "Page not found") {
							scope.debuggable = true;
							element.append(data.html);
							// Else process article here
						}
					}, function(data) {
						return;
					});
				} else {
				// Use oEmbed for others
					DebugLinkService.debugLinkIframely(undebuggedLink)
					.then(function(data) {
						if (data !== "Page not found") {
							scope.debuggable = true;
							if (data.links[0].html) {
								element.append(data.links[0].html);	
							}
						}			
					}, function(data) {
						return;
					});
				}
			}
		}
	};
}


directivesModule.directive('debuggedLink', debuggedLinkDirective);