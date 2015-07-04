'use strict';

var controllersModule = require('./_index');


controllersModule.controller('DataConnectCtrl', ['$scope', 'SearchService',
	function($scope, SearchService) {

	var vm = this;
	$scope.navItems = [
		{
			'title' : 'Data Source',
			'icon' : 'fa fa-database',
			'target' : 'data-source-tab'
		},
		{
			'title' : 'Email, Contact and Calendar',
			'icon' : 'fa fa-users',
			'target' : 'contact-tab'
		},
		{
			'title' : 'Internet of Things',
			'icon' : 'fa fa-share-alt',
			'target' : 'iot-tab'
		}
	];
	$scope.dataSourceItems = [];

	const query = '-/source_type=TWITTER&count=200&minified=true';

	SearchService.getData(query).then(function(data) {
		console.log("Done. " + data.statuses.length + " results");
		var statuses = data.statuses;
		statuses.forEach(function(status) {
			if (status.source_type !== "TWITTER") {
				$scope.dataSourceItems.push(status);
			}
		});
		console.log($scope.dataSourceItems);
	}, function() {});
}]);
