'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function SearchCtrl($http, AppSettings, SearchService) {
    var vm = this;

    vm.update = function(term) {
        SearchService.getData(term)
            .then(function(data) {
        	   vm.statuses = data.statuses;
            },
            function() {
        	   console.log('statuses retrieval failed.');
            });
    };

}

controllersModule.controller('SearchCtrl', SearchCtrl);