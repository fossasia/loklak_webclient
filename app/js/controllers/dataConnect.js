'use strict';
/* jshint unused:false */

var controllersModule = require('./_index');


controllersModule.controller('DataConnectCtrl', ['$scope', 'SearchService', 'PushService', 'SourceTypeService', 'ImportProfileService',
	function($scope, SearchService, PushService, SourceTypeService, ImportProfileService) {

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

	$scope.dataSourceEditableItems = 
	[
		{
			'label': 'Update frequency',
			'field': 'harvesting_freq',
			'filter' : 'dataSourceLifetime'
		},
		{
			'label': 'Lifetime',
			'field': 'lifetime'
		}
	]
	$scope.dataSourceItems = [];
	/**
	 * Add data source form inputs values, success & error message
	 */
	$scope.addForm = {};
	/**
	 * Add datasource form show state
	 */
	$scope.addFormOpen = false;

	$scope.sourceTypesList = SourceTypeService.sourceTypeList;

	$scope.mapRulesNum = 0;

	function updateDataSources(callback) {
		SearchService.getImportProfiles("").then(function(data) {

			var count_item = 0;
			for (var k in data.profiles) {
				var profile = data.profiles[k];
				profile.source_type = profile.source_type.toLowerCase();
				
				// Unknown source type
				if (!$scope.sourceTypesList[profile.source_type]) {
					console.error("Unknown source type : '" + profile.source_type + "'");
					continue;
				}
				profile.source_type = $scope.sourceTypesList[profile.source_type].name;
				profile.editing = false;
				$scope.dataSourceItems[count_item] = profile;
				count_item++;
			}
			if (callback) callback();
		}, function() {});
	};

	$scope.confirmAddDataSource = function() {

		function constructMapRules() {
			var mapRulesStr = '';
			const mapRules = $scope.addForm.inputs.mapRules;
			var prefix = '';
			if (!mapRules) return '';
			for (var i = 0; i < $scope.mapRulesNum; i++) {
				if (mapRules[i] && mapRules[i][0] !== '' && mapRules[i][1] !=='') {
					mapRulesStr += prefix + mapRules[i][0] + ':' + mapRules[i][1];
					prefix = ',';
				}
			}
			return mapRulesStr;
		}
		
		PushService.pushGeoJsonData($scope.addForm.inputs.url, $scope.addForm.inputs.type.key, constructMapRules()).then(function(data) {
			$scope.addForm.error = '';
			$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
			updateDataSources();
		}, function(err, status) {
			$scope.addForm.success = '';
			$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
		});
	};

	$scope.toggleAddForm = function() {
		$scope.addFormOpen = !$scope.addFormOpen;
	};

	$scope.addMapRule = function() {
		$scope.mapRulesNum++;
	};

	$scope.removeMapRule = function() {
		$scope.mapRulesNum--;
	};

	$scope.getMapRulesNum = function() {
		return new Array($scope.mapRulesNum);
	};

	$scope.onUpdateDataSources = function() {
		var refreshButton = angular.element("#refreshButton i"); 
		refreshButton.addClass("fa-spin");
		updateDataSources(function() {
			refreshButton.removeClass("fa-spin");
		});
	};

	$scope.showRowDetail = function(e) {
		angular.element(e.currentTarget).toggleClass("showing-detail");
	};

	$scope.toggleEditDataSource = function(event, item) {
		if (item.editing) {
			item.editing = false;
			angular.element(event.target).text("Edit").removeClass("btn-default").addClass("btn-info");
		} else {
			item.editing = true;
			angular.element(event.target).text("Cancel").removeClass("btn-info").addClass("btn-default");
		}
	}

	$scope.saveDataSource = function(item) {
		console.log("Saving" + item);
		ImportProfileService.update(item).then(function(data) {
			console.log(data);
		}, function(error) {
			console.error(error);
		})
	}
	$scope.deleteDataSource = function(item) {
		ImportProfileService.delete(item).then(function(data) {
			console.log(data);
			updateDataSources();
		}, function(error) {
			console.error(error);
		});
	}
}]);
