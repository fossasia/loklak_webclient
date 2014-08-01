require('angular');
require('angular-ui-router');

require('./controllers/index.js');

var app = angular.module('myApp', [
          'ui.router',

          'app.controllers'
        ]);