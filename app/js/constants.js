'use strict';
var env = require('node-env-file');
env('../../.env');

var AppSettings = {
  apiUrl: process.env.apiUrl
};

module.exports = AppSettings;