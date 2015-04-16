'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function SearchCtrl() {

  // ViewModel
  var vm = this;

  vm.title = 'AngularJS';
  vm.number = 1234;

}

controllersModule.controller('SearchCtrl', SearchCtrl);