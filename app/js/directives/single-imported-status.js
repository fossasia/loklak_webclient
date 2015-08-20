'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */

directivesModule.directive('singleImportedStatus', ['$location', '$rootScope', 'RichTextService', 'SourceTypeService', 
    'SearchService', 'ImportProfileService',
    function($location, $rootScope, RichTextService, SourceTypeService, SearchService, ImportProfileService) {
    return {
        scope: {
            data: '=',
            profile: '='
        },
        templateUrl: 'data-connect/single-imported-status.html',
        controller: function($scope, $element, $attrs) {
            $scope.debuggable = true;

            $scope.sourceType = SourceTypeService.sourceTypeList[$scope.data.source_type.toLowerCase()];
            $scope.richData = RichTextService.parseJSON($scope.data.text)[1];

            SearchService.retrieveAccount($scope.profile.importer).then(function(data) {
                $scope.importer = data.accounts[0];
            }, function(err) {
                console.error(err);
            });

            $scope.share = function() {
                ImportProfileService.share($scope.profile).then(function(data) {
                    console.log(data);
                }, function(err) {
                console.error(err);
                });
            };
        },
        link: function(scope, element, attrs) {
        }
    };
}]);
