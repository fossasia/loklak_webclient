'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function SingleTweetCtrl($scope, $stateParams, SearchService) {

	var vm = this;
	// Init result based on requested ID
	angular.element(document).ready(function() {
		console.log($stateParams);
		console.log($stateParams.q);
		if ($stateParams.q !== undefined) {
			SearchService.initData($stateParams)
				.then(function(data) {
					vm.status = data.statuses[0];
					console.log(vm.status);
				}, 
				function() {
					console.log('status initital retrieval failed');
				});
		}
	});
}

controllersModule.controller('SingleTweetCtrl', SingleTweetCtrl);