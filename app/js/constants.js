'use strict';
require('dotenv').config({path: '.env'});

var AppSettings = {
  apiUrl: process.env.apiUrl
};

module.exports = AppSettings;