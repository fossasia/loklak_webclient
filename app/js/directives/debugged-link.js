'use strict';

var directivesModule = require('./_index.js');


directivesModule.directive('debuggedLink', ['DebugLinkService', '$timeout', function(DebugLinkService, $timeout) {

	/**
	 * In short if the return debugged data type is 'link'
	 * Meaning no videos, or complicated iframe
	 * Render a simple preview of the link
	 * only when a thumbnail is available
	 */
	var generateArticleParts = function(data) {
		if (!data.thumbnail_url) {
			return false;
		} else {
			var author = (data.author && data.provider_name) ? '<a href="' + data.url + '" class="article-author">' + data.provider_name + ' - ' + data.author + '</a href="' + data.url + '">' : '';
			var title = (data.title) ? '<a href="' + data.url + '" class="article-title">' + data.title  + '</a href="' + data.url + '">' : '';
			var thumbnail = '<a href="' + data.url + '" class="article-img-container"><img src="' + data.thumbnail_url + '"></a href="' + data.url + '">';
			var container = '<div class="article-container" href="' + data.url + '">';

			return container + author + thumbnail + title + '</div>';
		}		
	};

	/**
	 * Generate template for mp4 video
	 */
	var generateMp4Template = function(src) {
		return '<video width="100%"" style="min-height: 350px;" controls><source src="' + src + '" type="video/mp4">Your browser does not support HTML5 video.</video>';
	};

	return {
		restrict: 'A',
		scope: {
			linkArray: "=",
			debuggable: "=",
			data: "=",
		},
		templateUrl: 'debugged-link.html',
		controller: function($scope) {
			$scope.debuggable = false;
		},
		link: function(scope, element) {	
			/**
			 * Take the embeded link 
			 *     Pic.twitter.com is already render in images and is not processed again
			 * Debug the link with injected service
			 * If return data is rich content [video], embed straigtfoward
			 * Else, generate a debugged modal for the link an embed it
			 * If result of debugged contains video, or thumbnail images, photos should be hidden
			 * Why timeout?
			 * scope is available
			 * but scope's properties is not initialized fast enough
			 * Not yet found a way around this
			 */

			$timeout(function() {
				var undebuggedLink = scope.linkArray[0];

				if (undebuggedLink.substr(-4) === '.mp4') {
					element.append(generateMp4Template(undebuggedLink));
					scope.debuggable = true;
					return;
				} else if (undebuggedLink && undebuggedLink.indexOf("pic.twitter.com") === -1) {
					DebugLinkService.debugLink(undebuggedLink).then(function(data) {
						if (data !== "Page not found") {
							scope.debuggable = true;
							if (data.type === "link" || data.type === "photo") {
								var template = generateArticleParts(data);
								if (template) {
									scope.debuggable = true;
									element.append(template);
								} else {scope.debuggable = false;}
							} else {
								if (data.type === "video") {
									scope.debuggable = true;
									element.append(data.html);
								}
							}
						}
					}, function() {scope.debuggable = false;});
				}
			}, 1000);	
		}
	};
}]);
