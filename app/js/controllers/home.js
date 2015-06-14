'use strict';

var controllersModule = require('./_index');


controllersModule.controller('HomeCtrl', ['$rootScope', 'HelloService', function($rootScope, HelloService) {
	var hello = HelloService;

	hello.on('auth.login', function(auth) {
		hello(auth.network).api('/me/share').then(function(twitterStatuses) {
			$rootScope.$apply(function() {
				$rootScope.root.twitterStatuses = twitterStatuses; 
				console.log($rootScope.root.twitterStatuses);
				console.log($rootScope.root);
			});
		}, function() {
			console.log("Unable to get your recent tweets");
		});
	});
}]);
