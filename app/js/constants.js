'use strict';

var fs = require('fs');
var AppSettings=JSON.parse(fs.readFileSync('custom_configFile.json', 'utf8'));

module.exports = AppSettings;