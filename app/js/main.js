'use strict';

var angular = require('angular');

// angular modules
require('angular-ui-router');
require('angular-animate');
require('angular-moment');
require('angular-resource');
require('angular-loading-bar');
require('ng-tags-input');
require('angular-base64-upload')
// /require('chart.js');
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
    'ngResource',
    'angularMoment',
    'angular-loading-bar',
    'locator',
    'templates',
    'app.controllers',
    'app.services',
    'app.directives',
    'app.filters',
    'ui.bootstrap.datetimepicker',
    'wu.masonry',
    'ngTagsInput',
    'colorpicker.module',
    'toggle-switch',
    'infinite-scroll',
    'ui.choices',
    'FBAngular',
    'akoenig.deckgrid',
    'chart.js',
    'naif.base64',
    'nya.bootstrap.select'
  ];

  // mount on window for testing
  window.app = angular.module('app', requires);

  angular.module('app').constant('AppSettings', require('./constants'));

  angular.module('app').config(require('./routes'));

  angular.module('app').run(require('./on_run'));

  angular.bootstrap(document, ['app']);

});