'use strict';
/* global angular */
/* jshint unused:false */

var directivesModule = require('./_index.js');

const MAGIC_NUMBER = 2147483647; // max java int

directivesModule.directive('datasourceLifetime', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        //convert data from view format to model format
        if (data === 'forever') {
          return MAGIC_NUMBER;
        }
        return data; //converted
      });

      ngModelController.$formatters.push(function(data) {
        //convert data from model format to view format
        if (data === MAGIC_NUMBER) {
          return 'forever';
        } 
        return data; //converted
      });
    }
  }
});

directivesModule.directive('datasourceHarvestingFreq', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        //convert data from view format to model format
        if (data === 'never') {
          return MAGIC_NUMBER;
        }
        return data; //converted
      });

      ngModelController.$formatters.push(function(data) {
        //convert data from model format to view format
        if (data === MAGIC_NUMBER) {
          return 'never';
        }
        return data; //converted
      });
    }
  }
});