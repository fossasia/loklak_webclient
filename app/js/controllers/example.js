'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function ExampleCtrl() {

  // ViewModel
  var vm = this;

  vm.title = 'Test Title';
  vm.number = 1234;

}

controllersModule.controller('ExampleCtrl', ExampleCtrl);