'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function WallCtrl($http, $interval, AppSettings, SearchService) {
    var vm = this;
    vm.term = null;
    vm.oldStatuses = [];
    vm.nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;

    var getNewStatuses = function(oldData, newData) {
        if(oldData.length === 0) return;
        return newData.filter(function(data) {
            var dataDate = new Date(data['created_at']);
            var lastDate = new Date(oldData[0]['created_at']);
            return dataDate > lastDate;
        });
    };

    var liveUpdate = function() {
        $interval(function() {
            if(!vm.term) return;
            SearchService.getData(vm.term)
                .then(function(data) {
                    var newStatuses = getNewStatuses(vm.oldStatuses, data.statuses);
                    angular.forEach(newStatuses, function(status) {
                        vm.nextStatuses.push(status);
                    });
                    vm.oldStatuses = data.statuses;
                });
        }, 5000)

    };

    $interval(function() {
        if(vm.nextStatuses.length === 0) return;
        vm.statuses.unshift(vm.nextStatuses[0]);
        vm.nextStatuses.shift();
    }, 3000);

    vm.update = function(term) {
        vm.displaySearch = false;
        vm.term = term;
        SearchService.getData(term)
            .then(function(data) {
                vm.oldStatuses = data.statuses;
                vm.statuses = data.statuses;
            },
            function() {
                console.log('statuses retrieval failed.');
            });
    };

    liveUpdate();

}

controllersModule.controller('WallCtrl', WallCtrl);