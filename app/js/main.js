'use strict';

var angular = require('angular');

// angular modules
require('angular-ui-router');
require('angular-animate');
require('angular-moment');
require('angular-loading-bar');
require('satellizer');
require('./templates');
require('./controllers/_index');
require('./services/_index');
require('./directives/_index');
require('./components/_index');
require('./filters/_index');

// create and bootstrap application
angular.element(document).ready(function() {

  var requires = [
    'ui.router',
    'ngAnimate',
    'angularMoment',
    'angular-loading-bar',
    'templates',
    'app.controllers',
    'app.services',
    'app.directives',
    'app.filters',
    'ui.bootstrap.datetimepicker',
    'wu.masonry',
    'satellizer'
  ];

  // mount on window for testing
  window.app = angular.module('app', requires);

  angular.module('app').constant('AppSettings', require('./constants'));

  angular.module('app').config(require('./routes'));

  angular.module('app').run(require('./on_run'));

  angular.bootstrap(document, ['app']);

});