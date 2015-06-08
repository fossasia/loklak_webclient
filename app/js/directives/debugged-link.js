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

	/*
	 * In short if the return debugged data type is 'link'
	 * Meaning no videos, or complicated iframe
	 * Render a simple preview of the link
	 * only when a thumbnail is available
	 */

	var generateArticleParts = function(data) {
		if (!data.thumbnail_url) {
			return '';
		}

		var author = (data.author && data.provider_name) ? '<a href="' + data.url + '" class="article-author">' + data.provider_name + ' - ' + data.author + '</a href="' + data.url + '">' : '';
		var title = (data.title) ? '<a href="' + data.url + '" class="article-title">' + data.title  + '</a href="' + data.url + '">' : '';
		var thumbnail = '<a href="' + data.url + '" class="article-img-container"><img src="' + data.thumbnail_url + '"></a href="' + data.url + '">';
		var container = '<div class="article-container" href="' + data.url + '">';

		return container + author + thumbnail + title + '</div>';
	};

	return {
		restrict: 'A',
		scope: {
			linkArray: "=",
			debuggable: "=",
		},
		controller: function($scope) {
			$scope.debuggable = false;
		},
		templateUrl: 'debugged-link.html',
		link: function(scope, element, attrs) {	
			/**
			 * Take the embeded link 
			 *     Pic.twitter.com is already render in images and is not processed again
			 * Debug the link with injected service
			 * If return data is rich content [video], embed straigtfoward
			 * Else, generate a debugged modal for the link an embed it
			 * If result of debugged contains video, or thumbnail images, photos should be hidden
			 * 
			 */
			var undebuggedLink = scope.linkArray[0];

			if (undebuggedLink && undebuggedLink.indexOf("pic.twitter.com") === -1) {

				DebugLinkService.debugLink(undebuggedLink)
				.then(
					function(data) {
						if (data !== "Page not found") {
							scope.debuggable = true;
							if (data.type == "link") {
								var template = generateArticleParts(data);
								if (template !== '') {
									scope.debuggable = true;
									element.append(template);
								}
							} else {
								scope.debuggable = true;
								element.append(data.html);
							}
						}
					}, function(data) {
						return;
					}
				);
			}
		}
	};
}


directivesModule.directive('debuggedLink', ['DebugLinkService', debuggedLinkDirective]);