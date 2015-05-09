'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function WallCtrl($http, AppSettings, SearchService) {
    var vm = this;
    vm.term = '';

    var liveUpdate = function() {
    
    }

    vm.update = function(term) {
        vm.term = term;
        SearchService.getStatuses(term)
            .then(function(statuses) {
                vm.statuses = statuses;
            },
            function() {
                console.log('statuses retrieval failed.');
            });
    };

}

controllersModule.controller('WallCtrl', WallCtrl);