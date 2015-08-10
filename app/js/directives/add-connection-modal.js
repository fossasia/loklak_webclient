'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

directivesModule.directive("addConnectionModal", ['$http', '$timeout', '$stateParams', 'SearchService', 'HarvestingFrequencyService', 'LoklakFieldService', 'PushService', 'SourceTypeService',
	function($http, $timeout, $stateParams, SearchService, HarvestingFrequencyService, LoklakFieldService, PushService, SourceTypeService) {
	return {
		restrict: 'A',
		templateUrl: "data-connect/add-connection-modal.html",
		controller: function($scope, $element, $attrs) {
			$scope.harvestingFreqList = HarvestingFrequencyService.values;
			$scope.sourceTypeList = SourceTypeService.sourceTypeList;
			$scope.sourceTypeListWEndpoint = {};
			$scope.loklakFields = LoklakFieldService.fieldList;
			// Form inputs
			$scope.inputs = { mapRules : {}};
			// Submit validation messages
			$scope.messages = {};

			for (var key in $scope.sourceTypeList) {
				if ($scope.sourceTypeList[key].endpoint) {
					$scope.sourceTypeListWEndpoint[key] = $scope.sourceTypeList[key];
				}
			}
			// Add geojson as a datasource format
			$scope.sourceTypeListWEndpoint['geojson'] =
			{
				'key': 'FOSSASIA_API',
				'name': 'GeoJson'
			};

			$scope.tabItems = [
				{
					'title' : 'Source Type',
					'icon' : 'fa fa-file-code-o',
					'target' : 'source-type-tab'
				},
				{
					'title' : 'Source URL & Info',
					'icon' : 'fa fa-cloud-upload',
					'target' : 'source-info-tab'
				},
				{
					'title' : 'Mapping Rules',
					'icon' : 'fa fa-exchange',
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
				$timeout(function() {
					angular.element('#next-step').trigger('click');
				}, 100);
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

				if (!$scope.inputs.url) {
					$scope.messages.error = 'Please provide a valid source url';
					return;
				}
				if (!$scope.inputs.sourceType) {
					$scope.messages.error = 'Please select a data source format';
					return;
				}
				function constructMapRules() {
					var mapRulesStr = '';
					const mapRules = $scope.inputs.mapRules;
					var prefix = '';
					for (var key in $scope.inputs.mapRules) {
						var data = $scope.inputs.mapRules[key];
						if (data[0] && data[0].length > 0) {
							mapRulesStr += prefix + mapRules[i][0] + ':' + mapRules[i][1];
							prefix = ',';
						}
					}
					return mapRulesStr;
				}
				console.log($scope.inputs.sourceType);
				if ($scope.inputs.sourceType === 'geojson') {
					PushService.pushGeoJsonData($scope.inputs.url, $scope.inputs.sourceType, constructMapRules()).then(function(data) {
			 			$scope.messages.error = '';
			 			$scope.messages.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
			 		}, function(err, status) {
			 			$scope.messages.success = '';
			 			$scope.messages.error = 'Add new source failed. Please verify link avaibility & data format.';
					});
				} else {
					PushService.pushCustomData($scope.inputs.url, $scope.sourceTypeList[$scope.inputs.sourceType].endpoint).then(function(data) {
						$scope.messages.error = '';
						$scope.messages.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
					}, function(err, status) {
						$scope.messages.success = '';
						$scope.messages.error = 'Add new source failed. Please verify link avaibility & data format.';
					});
				}
			};

			$scope.hideErrorPanel = function() {
				$scope.messages.error = '';
			};

			$scope.hideSuccessPanel = function() {
				$scope.messages.success = '';
			};

			$scope.hideValidateErrorPanel = function() {
				$scope.messages.validateError = '';
			}

			$scope.validateSourceUrl = function() {
				if (!$scope.inputs.url) {
					$scope.validateStatus = '';
					$scope.messages.validateError = '';
					return;
				}

				if (!$scope.inputs.sourceType) {
					$scope.messages.validateError = 'Please select a source type';
				}
				$scope.validateStatus = 'waiting';
				PushService.validate($scope.inputs.url, $scope.inputs.sourceType).then(function(data) {
					if (data.status == 'offline' || data.status == 'invalid') {
						$scope.validateStatus = 'error';
						$scope.messages.validateError = 'Data format is not valid for source type ' + $scope.sourceTypeList[$scope.inputs.sourceType].name;
					} else {
						$scope.validateStatus = 'success';
						$scope.messages.validateError = '';
						$scope.currentData = JSON.parse(data.content);
					}
				}, function(err, status) {
					$scope.validateStatus = 'error';
					$scope.messages.validateError = 'Unknown server error'; 
					if (err) 
						$scope.messages.validateError += ': ' + err;
				});
			};

			function accessDataField(data, field) {
				var dotPos = field.indexOf(".");
				if (dotPos === -1) {
					return data[field];
				}
				var firstPart = field.substr(0, dotPos);
				var secondPart = field.substr(dotPos+1);
				return accessDataField(data[firstPart], secondPart);
			}

			$scope.accessDataField = function(row) {
				if ($scope.inputs.mapRules[row][0]) return accessDataField($scope.currentData, $scope.inputs.mapRules[row][0]);
			}
		}
	};
}]);
