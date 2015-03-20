'use strict';

var angular = require('angular');
var bulk = require('bulk-require');

module.exports = angular.module('app.controllers', []);

bulk(__dirname, ['./**/!(*_index|*.spec).js']);