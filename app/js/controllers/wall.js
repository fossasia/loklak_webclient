'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */

function WallCtrl($http, $location, $timeout, $interval, AppSettings, SearchService) {
    var vm = this;
    vm.term = null;
    vm.prevStatuses = [];
    vm.nextStatuses = [];
    vm.statuses = [];
    vm.displaySearch = true;
    vm.searchQuery = $location.search().q;

    vm.newSearch = function() {
        $location.url($location.path());
    };

    if(vm.searchQuery) {
        vm.term = vm.searchQuery;

        $http.jsonp(AppSettings.apiUrl+'search.json?callback=JSON_CALLBACK', {
          params: {q: vm.term}
        }).success(function(data) {
            vm.update(vm.term)
        }).error(function(err, status) {
            console.log("Throwing error HTTP Request.");
        });
    }
    console.log(vm);
    console.log(vm.term)
    var getNewStatuses = function(oldStatuses, newStatuses) {
        var oldIds = {}
        oldStatuses.forEach(function(status) {
            oldIds[status['id_str']] = status;
        });

        return newStatuses.filter(function(status) {
            return !(status['id_str'] in oldIds);
        });
    }

    var getRefreshTime = function(period) {
        if(period < 7000) return 5000;
        if(period <= 3000) return 0.7 * period;
        return 20000;
    }

    var liveUpdate = function(refreshTime) {
        return $timeout(function() {
            SearchService.getData(vm.term)
                .then(function(data) {
                    var newRefreshTime = getRefreshTime(data.search_metadata.period);

                    var newStatuses = [];
                    if(vm.prevStatuses.length === 0) {
                        newStatuses = data.statuses;
                        var len = newStatuses.length;
                        for (var index=0; index < len; index++) {
                            var profileURLString = newStatuses[index].user.profile_image_url_https;
                            var splitURL = profileURLString.split('_bigger');
                            newStatuses[index].user.profile_image_url = splitURL[0]+splitURL[1];
                        }
                    } else {
                        newStatuses = getNewStatuses(vm.prevStatuses, data.statuses);
                    }
                    
                    angular.forEach(newStatuses, function(status) {
                        vm.nextStatuses.unshift(status);
                    });

                    vm.prevStatuses = data.statuses;
                
                    return liveUpdate(newRefreshTime);
                });
        }, refreshTime);
    };

    $interval(function() {
        if(vm.nextStatuses.length === 0) return;
        vm.statuses.unshift(vm.nextStatuses[0]);
        vm.nextStatuses.shift();
    }, 3000);

    vm.update = function(term) {
        if(!term) return;
        vm.displaySearch = false;
        vm.term = term;
        liveUpdate(0);
    };

    vm.urlupdate = function URLSearch(term) {
        if(!term) return;
        vm.displaySearch = false;
        vm.term = term;
        liveUpdate(0);
    }
}

controllersModule.controller('WallCtrl', WallCtrl);