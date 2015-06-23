'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, AppSettings, SearchService) {

	var vm = this;
	vm.sinceDate = new Date();
	vm.untilDate = new Date();  		
	vm.foo = "foo";
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);