'use strict';

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');


controllersModule.controller('TopologyCtrl', ['$filter', '$timeout', '$location', '$rootScope', '$scope', 'HelloService', 'SearchService', function($filter, $timeout, $location, $rootScope, $scope, HelloService, SearchService) {

	var vm = this;
	vm.pool = [];
	vm.showResult = false;
	vm.statuses = [];
	vm.screenName = "loklak_app";

	/*
	 * Infinity scroll directive's trigger
	 * trigger arg: @amount
	 * An @amount of statuses will be concatenated to the current result
	 * If the pool of statuses's level is low, get more statuses
	 * Is also used to init the shown result
	*/
	$scope.loadMore = function(amount) {
	    if (vm.pool.length < (2 * amount + 1)) {
            getMoreStatuses();
        }
        vm.statuses = vm.statuses.concat(vm.pool.slice(0,amount));
        vm.pool = vm.pool.splice(amount);
	    
	};

	function getMoreStatuses() {
	    if (vm.pool.length > 0) { 
	        // Get new time span bound from the lastest status
	        var currentUntilBound = new Date(vm.pool[vm.pool.length -1 ].created_at)
	        var newUntilBound = new Date(currentUntilBound.getTime() - 1);
	        var untilSearchParam = $filter("date")(newUntilBound, "yyyy-MM-dd_HH:mm");
	        var newSearchParam = "from:" + vm.screenName + "+until:" + untilSearchParam;
	        var params = {
	           q: newSearchParam,
	           timezoneOffset: (new Date().getTimezoneOffset())
	        };

	        // Get new data and concat to the current result
	        SearchService.initData(params).then(function(data) {
	               vm.pool = vm.pool.concat(data.statuses);
	        }, function() {});    
	    }
	};




	angular.element(document).ready(function() {
		if ($location.search().screen_name) {
			vm.screenName = $location.search().screen_name;
		}

		var term = "from:" + vm.screenName;
		SearchService.getData(term).then(function(data) {
			vm.pool = data.statuses;
			vm.statuses = [];
			$scope.loadMore(20);
			vm.showResult = true;
		}, function() {});		
	})

	/*
	 * Status's dỉrective openSwipe fn  
	 * Clicking on an image results in a photoswipe
	 * Docs: http://photoswipe.com/documentation/getting-started.html
	 */
	vm.openSwipe = function(status_id) {
	    var items = [];
	    var images  = angular.element('#' + status_id + ' .images-wrapper img');
	    var options = { index: 0, history: false};
	    var swipeEle = document.querySelectorAll('.pswp')[0];
	    var swipeObject = 'gallery' + status_id;

	    angular.forEach(images, function(image) {
	        this.push(scrapeImgTag(image));
	    }, items);
	    $timeout(function() {
	        window[swipeObject] = new PhotoSwipe(swipeEle, PhotoSwipeUI_Default, items, options);
	        window[swipeObject].init();    
	    }, 0);
	};

	function scrapeImgTag(imgTag) {
	    var ngEle = angular.element(imgTag);
	    return {
	        src: ngEle.attr('src'),
	        w: parseInt(ngEle.css('width').replace('px', '')),
	        h: parseInt(ngEle.css('height').replace('px', ''))
	    };
	}
}]);
