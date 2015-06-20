'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */

 directivesModule.directive('account', function() {
 	return {
 		scope: {
 			data: '=',
 		},
 		templateUrl: 'account.html',
 	};
 });