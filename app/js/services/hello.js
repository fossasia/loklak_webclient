'use strict';

var servicesModule = require('./_index.js');
var hello = require('../components/hello.all.js');

/**
 * @ngInject
 */
function HelloService() {

  return hello;

}

servicesModule.service('HelloService',[HelloService]);
