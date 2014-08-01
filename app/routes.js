var fs = require('fs');

module.exports = function($routeProvider, $locationProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true);

    $stateProvider
    .state('/', {
        template: fs.readFileSync('public/js/views/home.html')
    });

    $urlRouterProvider.otherwise('/');

};