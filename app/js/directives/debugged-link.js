'use strict';
/* jshint unused:false */

var directivesModule = require('./_index.js');


directivesModule.directive('debuggedLink', ['DebugLinkService', '$timeout', function(DebugLinkService, $timeout) {

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
	 * Generate template for mp4 video
	 */
	var generateMp4Template = function(src) {
		return '<video width="100%"" style="min-height: 350px;" controls><source src="' + src + '" type="video/mp4">Your browser does not support HTML5 video.</video>';
	};

	/**
	 * From iframely result, if data.html is not available
	 * find html in links array
	 * return html as result
	*/
	var findHtml = function(linkArray) {
		var keepSearching = true;
		var i = 0;
		var result = false;
		while (keepSearching && i < linkArray.length) {
			var linkObj = linkArray[i];
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
			linkArray: "=",
			debuggable: "=",
			data: "=",
			imageLink: "="
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

				if (undebuggedLink && undebuggedLink.substr(-4) === '.mp4') {
					// native twitter video
					element.append(generateMp4Template(undebuggedLink));
					scope.debuggable = true;
					return;
				} else if (undebuggedLink && undebuggedLink.indexOf("www.facebook.com") > -1) {
					console.log("FOOOOOOOOOOOOOOOOOOO");
					DebugLinkService.debugLinkOembed(undebuggedLink).then(function(data) {
						console.log(data);
						if (data && data.html) {
							element.append(data.html);
						}
					}, function() {});
				} else if (undebuggedLink && undebuggedLink.indexOf("pic.twitter.com") === -1 && undebuggedLink.indexOf("www.facebook.com") === -1) {
					console.log("BARRRRRRRRRRRRRRR")
					DebugLinkService.debugLink(undebuggedLink).then(function(data) {
						var tagToAppend = "";
						if (data.html) { // When embed is available and html is the only choice
							tagToAppend = data.html;
							scope.debuggable = true;
						} else { // When embed is available and there are multiple choice
							var detailedData = findHtml(data.links);
							if (detailedData) {
								// Remove auto_play of videos from twitch
								if (detailedData.indexOf('playerType=facebook') > -1 && detailedData.indexOf('auto_play=false') === -1) {
									detailedData = detailedData.replace('playerType=facebook', 'playerType=facebook&auto_play=false');
								}
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
						}
						/*if (data !== "Page not found") {
							scope.debuggable = true;
							if (data.type === "link" || data.type === "photo") {
								// no html given, have to generate before append
								var template = generateArticleParts(data);
								if (template) {
									scope.debuggable = true;
									element.append(template);
								} else {scope.debuggable = false;}
							} else {
								// html given from the result
								if (data.type === "video" || data.type === "rich") {
									scope.debuggable = true;
									element.append(data.html);
								}
							}
						}*/
					}, function() {scope.debuggable = false;});
				}
			}, 1000);	
		}
	};
}]);
