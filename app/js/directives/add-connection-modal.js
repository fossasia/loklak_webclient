'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("addConnectionModal", ['$stateParams', 'SearchService', 'HarvestingFrequencyService', 'LoklakFieldService', 'PushService', 'SourceTypeService',
	function($stateParams, SearchService, HarvestingFrequencyService, LoklakFieldService, PushService, SourceTypeService) {
	return {
		restrict: 'A',
		templateUrl: "data-connect/add-connection-modal.html",
		controller: function($scope, $element, $attrs) {
			$scope.harvestingFreqList = HarvestingFrequencyService.values;
			$scope.sourceTypeList = SourceTypeService.sourceTypeList;
			$scope.sourceTypeListWEndpoint = {};
			$scope.loklakFields = LoklakFieldService.fieldList;
			$scope.inputs = {mapRules : {}};

			for (var key in $scope.sourceTypeList) {
				if ($scope.sourceTypeList[key].endpoint) {
					$scope.sourceTypeListWEndpoint[key] = $scope.sourceTypeList[key];
				}
			}
			$scope.tabItems = [
				{
					'title' : 'Source Type',
					'icon' : 'fa fa-database',
					'target' : 'source-type-tab'
				},
				{
					'title' : 'Source URL & Info',
					'icon' : 'fa fa-users',
					'target' : 'source-info-tab'
				},
				{
					'title' : 'Mapping Rules',
					'icon' : 'fa fa-share-alt',
					'target' : 'mapping-rule-tab'
				}
			];
			$scope.selectedTab = 0;
			$scope.showNext = true;

			for (var key in $scope.loklakFields) {
				if (!$scope.inputs.mapRules[key]) {
					$scope.inputs.mapRules[key] = [];
				}
				$scope.inputs.mapRules[key][1] = $scope.loklakFields[key]; // fill second column with loklak fields
			}

			$scope.closeSettingModal = function() {
				angular.element("#add-connect-setting-modal").css('display', 'none');
				angular.element(".modal-backdrop").remove();
			};

			$scope.setSourceType = function(e) {
				$scope.inputs.sourceType = e.currentTarget.id;
			};

			$scope.proceed = function() {
				$scope.selectedTab++;
				if ($scope.selectedTab == 2) {
					$scope.showNext = false;
				}
				angular.element('.nav-tabs > .active').next('li').find('a').trigger('click');
			};

			$scope.tabSelected = function(selected) {
				$scope.selectedTab =selected;
				if ($scope.selectedTab == 2) {
					$scope.showNext = false;
				} else {
					$scope.showNext = true;
				}
			};

			$scope.submit = function() {
				function constructMapRules() {
					var mapRulesStr = '';
					const mapRules = $scope.addForm.inputs.mapRules;
					var prefix = '';
					for (var i = 0; i < $scope.mapRulesNum; i++) {
						mapRulesStr += prefix + mapRules[i][0] + ':' + mapRules[i][1];
						prefix = ',';
					}
					return mapRulesStr;
				}

				if ($scope.inputs.sourceType === 'geojson') {
					PushService.pushGeoJsonData($scope.inputs.url, $scope.addForm.sourceType, constructMapRules()).then(function(data) {
			 			$scope.addForm.error = '';
			 			$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
			 		}, function(err, status) {
			 			$scope.addForm.success = '';
			 			$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
					});
				} else {
					PushService.pushCustomData($scope.inputs.sourceType, $scope.sourceTypeList[$scope.endpoint].endpoint).then(function(data) {
						$scope.addForm.error = '';
						$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
					}, function(err, status) {
						$scope.addForm.success = '';
						$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
					});
				}
			};

			$scope.validateSubmit = function() {
				return $scope.inputs.url && $scope.inputs.sourceType;
			};
		}
	};
}]);