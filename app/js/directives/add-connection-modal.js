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
			
			const sourceTypeFields = LoklakFieldService.sourceTypeFields;
			// List of fields that user can map data to. Depending on selected source type
			$scope.currentLoklakFields = null;
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
				'name': 'GeoJson',
				'logo': '/images/external/geojson.png'
			};

			$scope.tabItems = [
				{
					'title' : 'Source Format',
					'icon' : 'fa fa-file-code-o',
					'target' : 'source-format-tab'
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

			$scope.closeSettingModal = function() {
				angular.element("#add-connect-setting-modal").css('display', 'none');
				angular.element(".modal-backdrop").remove();
			};

			$scope.setSourceFormat = function(e) {
				$scope.inputs.sourceFormat = e.currentTarget.id;
				$scope.proceed();
				// refresh validation state
				$scope.validateSourceUrl();

				// pick only map rules that apply for this source type
				$scope.currentLoklakFields = {};
				if (sourceTypeFields[$scope.inputs.sourceFormat]
					&& sourceTypeFields[$scope.inputs.sourceFormat].length != 0) {
					for (var key in sourceTypeFields[$scope.inputs.sourceFormat]) {
						var data = sourceTypeFields[$scope.inputs.sourceFormat][key];
						$scope.currentLoklakFields[data] = $scope.loklakFields[data];
					}
				} else {
					$scope.currentLoklakFields = null;
				}
			};

			$scope.proceed = function() {
				$scope.selectedTab++;
				if ($scope.selectedTab == 2) {
					$scope.showNext = false;
				}
				setTimeout(function() {
					angular.element('.nav-tabs > .active').next('li').find('a').trigger('click');
				}, 0);
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
				if (!$scope.inputs.sourceFormat) {
					$scope.messages.error = 'Please select a data source format';
					return;
				}
				function constructMapRules() {
					var mapRulesStr = '';
					const mapRules = $scope.inputs.mapRules;
					var prefix = '';
					for (var key in mapRules) {
						var data = $scope.inputs.mapRules[key];
						if (data[0] && data[0].length > 0) {
							mapRulesStr += prefix + mapRules[key][0] + ':' + mapRules[key][1];
							prefix = ',';
						}
					}
					return mapRulesStr;
				}
				var lifetime = null;
				if ($scope.inputs.lifetime)
					lifetime = new Date($scope.inputs.lifetime).getTime();
				if ($scope.inputs.sourceFormat === 'geojson') {
					if (!$scope.inputs.sourceType) {
						$scope.messages.error = 'Please select a source type';
						return;
					}
					PushService.pushGeoJsonData(
						{ url: $scope.inputs.url, 
						  source_type: $scope.inputs.sourceType.key,
						  map_type: constructMapRules(),
						  harvesting_freq: $scope.inputs.harvesting_freq.value,
						  lifetime: lifetime,
						  public: $scope.inputs.public
						}
					).then(function(data) {
			 			$scope.messages.error = '';
			 			$scope.messages.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
			 		}, function(err, status) {
			 			$scope.messages.success = '';
			 			$scope.messages.error = 'Add new source failed. Please verify link avaibility & data format.';
					});
				} else {
					PushService.pushCustomData(
						{ url: $scope.inputs.url, 
						  source_type: $scope.inputs.sourceFormat,
						  map_type: constructMapRules(),
						  harvesting_freq: $scope.inputs.harvesting_freq.value,
						  lifetime: lifetime,
						  public: $scope.inputs.public
						}, $scope.sourceTypeList[$scope.inputs.sourceFormat].endpoint).then(function(data) {
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
				$scope.currentData = null;
				$scope.showCurrentData = false;
				if (!$scope.inputs.url) {
					$scope.validateStatus = '';
					$scope.messages.validateError = '';
					return;
				}

				if (!$scope.inputs.sourceFormat) {
					$scope.messages.validateError = 'Please select a source type';
				}
				$scope.validateStatus = 'waiting';
				PushService.validate($scope.inputs.url, $scope.inputs.sourceFormat).then(function(data) {
					if (data.status == 'offline') {
						$scope.validateStatus = 'error';
						$scope.messages.validateError = 'The provided url is unreachable.';
					} else if (data.status == 'invalid') {
						$scope.validateStatus = 'error';
						$scope.messages.validateError = 'Data format is not valid for source type ' + $scope.sourceTypeList[$scope.inputs.sourceFormat].name;
					} else if (data.status = 'unsupported') {
						$scope.validateStatus = '';
						$scope.messages.validateError = '';
						$scope.currentData = JSON.parse(data.content);
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
				if ($scope.inputs.mapRules[row][0] && $scope.currentData) return accessDataField($scope.currentData, $scope.inputs.mapRules[row][0]);
			}

			$scope.clearModalData = function() {
				$scope.currentData = null;
				$scope.showCurrentData = false;
				$scope.inputs = { mapRules : {}};
				$scope.validateStatus = '';
				$scope.messages = {};
				// Default values
				$scope.inputs.harvesting_freq = {'value': 360, 'label':'6 hours'};
				$scope.inputs.public = true;

				for (var key in $scope.loklakFields) {
					if (!$scope.inputs.mapRules[key]) {
						$scope.inputs.mapRules[key] = [];
					}
					$scope.inputs.mapRules[key][1] = $scope.loklakFields[key].value; // fill second column with loklak fields
				}
			};

			$scope.clearModalData();
		}
	};
}]);
