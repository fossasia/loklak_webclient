'use strict';
/* jshint unused:false */

var controllersModule = require('./_index');


controllersModule.controller('DataConnectCtrl', ['$scope', '$stateParams', 'SearchService', 'PushService', 'SourceTypeService', 'ImportProfileService', 'HarvestingFrequencyService',
	function($scope, $stateParams, SearchService, PushService, SourceTypeService, ImportProfileService, HarvestingFrequencyService) {

	if ($stateParams.source_type != null) {
		$stateParams.source_type = $stateParams.source_type.toLowerCase();

		// invalid 'source_type' parameter : returning to default MyConnection page
		if (!SourceTypeService.sourceTypeList[$stateParams.source_type]) {
			$location.url('/dataConnect');
			return;
		}
	}

	// duration (in ms) of waiting for elastic up-to-date state before retrieval new datasource list
	const DELAY_BEFORE_RELOAD = 2000;

	$scope.dataSourceEditableItems = 
	[
		{
			'label': 'Update frequency',
			'field': 'harvesting_freq'
		},
		{
			'label': 'Lifetime',
			'field': 'lifetime'
		}
	]
	$scope.dataSourceItems = [];
	/**
	 * Messages that are displayed in the main datasource page
	 */
	$scope.dataSourceMessages = {};

	$scope.sourceTypesList = SourceTypeService.sourceTypeList;
	$scope.harvestingFreqList = HarvestingFrequencyService.values;
	$scope.mapRulesNum = 0;

	function updateDataSources(callback) {
		SearchService.getImportProfiles($stateParams.source_type || "").then(function(data) {
			var count_item = 0;
			$scope.dataSourceItems = [];
			for (var k in data.profiles) {
				var profile = data.profiles[k];
				profile.source_type = profile.source_type.toLowerCase();
				// Unknown source type
				if (!$scope.sourceTypesList[profile.source_type]) {
					console.error("Unknown source type : '" + profile.source_type + "'");
					profile.display_source_type = profile.source_type;
				} else {
					profile.display_source_type = $scope.sourceTypesList[profile.source_type].name;
				}
				profile.editing = false;
				$scope.dataSourceItems[count_item] = profile;
				count_item++;
			}
			if (callback) callback();
		}, function() {});
	};

	$scope.onUpdateDataSources = function() {
		$scope.dataSourceMessages = {};
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
			angular.element(event.target).text("Edit").removeClass("btn-default").addClass("btn-loklak-blue");
		} else {
			item.editing = true;
			angular.element(event.target).text("Cancel").removeClass("btn-loklak-blue").addClass("btn-default");
		}
	}

	$scope.saveDataSource = function(item) {
		console.log("Saving" + item);
		ImportProfileService.update(item).then(function(data) {
			setTimeout(updateDataSources, DELAY_BEFORE_RELOAD);
		}, function(error) {
			console.error(error);
			$scope.dataSourceMessages.error = 'Unable to save edited changes. If the problem persists, please contact loklak administrator for help.';
		})
	}
	$scope.deleteDataSource = function(item) {
		ImportProfileService.delete(item).then(function(data) {
			console.log(data);
			setTimeout(updateDataSources, DELAY_BEFORE_RELOAD);
			$scope.dataSourceMessages.success = 'Data source deleted.';
		}, function(error) {
			console.error(error);
			$scope.dataSourceMessages.error = 'Unable to delete data source. If the problem persists, please contact loklak administrator for help.';
		});
	}

	updateDataSources();
}]);
