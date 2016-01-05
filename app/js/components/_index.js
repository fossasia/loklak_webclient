/*jslint node: true */
/*archiebnz linted 1/1*/
'use strict';

var angular = require('angular');
var bulk = require('bulk-require');

module.exports = angular.module('app.components', []);

bulk(__dirname, ['./**/!(*_index|*.spec).js']);