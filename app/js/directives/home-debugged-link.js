'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');


directivesModule.directive('homeDebuggedLink', ['DebugLinkService', '$timeout', function(DebugLinkService, $timeout) {

	/**
	 * In short if the return debugged data type is 'link'
	 * Meaning no videos, or complicated iframe
	 * Render a simple preview of the link
	 * only when a thumbnail is available
	 */
	var generateArticleParts = function(data) {
			var site = (data.site) ? '<a href="' + data.canonical + '" class="article-site">' + data.site + '</a>' : '';
			var title = (data.title) ? '<a href="' + data.canonical + '" class="article-title">' + data.title  + '</a href="' + data.canonical + '">' : '';
			var thumbnail = '<a href="' + data.canonical + '" class="article-img-container"><img src="' + data.thumbnail_url + '"></a href="' + data.canonical + '">';
			var container = '<div class="article-container" href="' + data.canonical + '">';

			return container + site + thumbnail + title + '</div>';	
	};

	/**
	 * From iframely result, if data.html is not available
	 * find html in links array
	 * return html as result
	*/
	var findHtml = function(entities) {
		var keepSearching = true;
		var i = 0;
		var result = false;
		while (keepSearching && i < entities.length) {
			var linkObj = entities[i];
			for (var key in linkObj) {
				if (key === "html") {
					result = linkObj.html;
					keepSearching = false;
				}
			}
			i = i+1;
		}
		return result;
	};

	/**
	 * From iframely result, if data.html is not available both in data root & data.link
	 * find thumbnail
	 * thumbnail with rel containing social media source has higher priority
	 * for now the only high priority social source is twitter
	*/
	var findThumb = function(data) {

		// Loop round 1 finding thumbnail that also has a social media rel
		var keepSearching = true;
		var i = 0;
		var result = false;
		while (keepSearching && i < data.links.length) {
			var linkObj = data.links[i];
			if (linkObj.rel.indexOf("twitter") > -1 && linkObj.rel.indexOf("thumbnail") > -1) {
				data.meta.thumbnail_url = linkObj.href;
				result = data.meta;
				keepSearching = false;
			}
			i = i+1;
		}
		if (result) {
			return result; 
		}

		// Just find a thumbnail
		keepSearching = true;
		i = 0;
		result = false;
		while (keepSearching && i < data.links.length) {
			if (linkObj.rel.indexOf("thumbnail") > -1) {
				data.meta.thumbnail_url = linkObj.href;
				result = data.meta;
				keepSearching = false;
			}
			i = i+1;
		}
		return result;
	};

	return {
		restrict: 'A',
		scope: {
			entities: "="
		},
		templateUrl: 'home-debugged-link.html',
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
				if (scope.entities) {
					if (scope.entities.urls.length === 0 && scope.entities.media) {
						var link = scope.entities.media[0].media_url_https;
						element.append('<img src="' + link + '" alt="" width="100%">');
					}

					if (scope.entities.urls.length !== 0 && (scope.entities.urls[0].expanded_url.indexOf("pic.twitter.com") === -1)) {
						var undebuggedLink = scope.entities.urls[0].expanded_url;
						DebugLinkService.debugLink(undebuggedLink).then(function(data) {
							var tagToAppend = "";
							if (data.html) { // When embed is available and html is the only choice
								tagToAppend = data.html;
								scope.debuggable = true;
							} else { // When embed is available and there are multiple choice
								var detailedData = findHtml(data.links);
								if (detailedData) {
									tagToAppend = detailedData;
								} else {
									var moreDetailedData = findThumb(data);
									if (moreDetailedData) {
										tagToAppend = generateArticleParts(moreDetailedData);
									}
								}
							}

							if (tagToAppend) {
								element.append(tagToAppend);
								scope.debuggable = true;
							} else {
								if (scope.entities.media) {
									var link = scope.entities.media[0].media_url_https;
									element.append('<img src="' + link + '" alt="" width="100%">');
								}
							}
						}, function() {});
					}
				} 
			}, 1000);	
		}
	};
}]);
