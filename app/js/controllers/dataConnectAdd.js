'use strict'
/* jshint unused:false */

var controllersModule = require('./_index');


controllersModule.controller('AddConnectionCtrl', ['$scope', '$stateParams', 'SearchService', 'PushService', 'SourceTypeService',
	function($scope, $stateParams, SearchService, PushService, SourceTypeService) {

		const defaultFormat = 'geojson';
		const geojsonType = {
			'name': 'GeoJson'
		}
		$scope.sourceTypesList = SourceTypeService.sourceTypeList;


		$scope.dataFormat =	 $stateParams.format || defaultFormat;
		$scope.dataFormat = $scope.dataFormat.toLowerCase();
		$scope.isGeoJson = $scope.dataFormat === 'geojson';

		if ($scope.isGeoJson) {
			$scope.dataFormatInfo = geojsonType;
		} else {
			$scope.dataFormatInfo = $scope.sourceTypesList[$scope.dataFormat];
		}

		/**
		 * Add data source form inputs values, success & error message
		 */
		$scope.addForm = {};

		$scope.mapRulesNum = 0;

		function getDataSources() {
			SearchService.getImportProfiles("").then(function(data) {
				var profiles = data.profiles;
				profiles.forEach(function(profile) {
					profile.source_type = SourceTypeService.convert(profile.source_type);
					$scope.dataSourceItems.push(profile);
				});
			}, function() {});
		}

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

			if ($scope.isGeoJson) {
				PushService.pushGeoJsonData($scope.addForm.inputs.url, $scope.addForm.inputs.type, constructMapRules()).then(function(data) {
					$scope.addForm.error = '';
					$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
				}, function(err, status) {
					$scope.addForm.success = '';
					$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
				});
			} else {
				PushService.pushCustomData($scope.addForm.inputs.url, $scope.dataFormatInfo.endpoint).then(function(data) {
					$scope.addForm.error = '';
					$scope.addForm.success = data.known + ' source(s) known, ' + data['new'] + ' new source(s) added';
				}, function(err, status) {
					$scope.addForm.success = '';
					$scope.addForm.error = 'Add new source failed. Please verify link avaibility & data format.';
				});
			}
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
	}
]);