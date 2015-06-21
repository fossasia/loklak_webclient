'use strict';

var gulp   = require('gulp');
var fs = require('fs');
var request = require('sync-request');



gulp.task('settings', function() {
        var AppSettings=JSON.parse(fs.readFileSync('custom_configFile.json', 'utf8'));
        var url = AppSettings.apiUrl + 'settings.json';
        var res = request('GET', url);
        var jsonRes = JSON.parse(res.getBody());
        console.log("Got additional configs from server: ", jsonRes);
        var settingsResult = {};

        for(var key in AppSettings) settingsResult[key] = AppSettings[key];
        for(var key in jsonRes) settingsResult[key] = jsonRes[key];
        
        fs.writeFileSync('custom_configFile.json', JSON.stringify(settingsResult, null, 4), 'utf8');
});