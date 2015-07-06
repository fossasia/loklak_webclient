'use strict';

var controllersModule = require('./_index');


controllersModule.controller('DataConnectCtrl', ['$scope', 'SearchService', 'PushService', 'SourceTypeService',
	function($scope, SearchService, PushService, SourceTypeService) {

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
	/**
	 * Add data source form inputs values, success & error message
	 */
	$scope.addForm = {inputs : {}, success: '', error : ''};
	/**
	 * Add datasource form show state
	 */
	$scope.addFormOpen = false;

	$scope.sourceTypesList = SourceTypeService.sourceTypeList;

	function getDataSources() {
		const query = '-/source_type=TWITTER';
		SearchService.getData(query).then(function(data) {
			var statuses = data.statuses;
			statuses.forEach(function(status) {
				if (status.source_type !== 'TWITTER') {
					$scope.dataSourceItems.push(status);
				}
			});
		}, function() {});
	}

	$scope.confirmAddDataSource = function() {
		PushService.pushGeoJsonData($scope.addForm.inputs.url, $scope.addForm.inputs.type).then(function(data) {
			$scope.addForm.error = '';
			$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
		}, function(err, status) {
			$scope.addForm.success = '';
			$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
		});
	}

	$scope.toggleAddForm = function(){
		$scope.addForm.error = null;
		$scope.addForm.success = null;
		$scope.addFormOpen = !$scope.addFormOpen;
	}

	getDataSources();
}]);
