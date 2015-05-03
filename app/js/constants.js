'use strict';

var fs = require('fs');
var AppSettings=JSON.parse(fs.readFileSync('configFile.json', 'utf8'));

module.exports = AppSettings;