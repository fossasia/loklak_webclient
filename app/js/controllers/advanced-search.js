'use strict';

var controllersModule = require('./_index');

function AdvancedSearchCtrl($http, AppSettings, SearchService) {

	var vm = this;
	// Init period to search - 6 month
/*	vm.sinceDate = new Date();
	vm.sinceDate.setMonth(getMonth()-6);
	vm.untilDate = new Date();*/  		
	vm.foo = "foo";
}

controllersModule.controller('AdvancedSearchCtrl', ['$http', 'AppSettings', 'SearchService', AdvancedSearchCtrl
]);