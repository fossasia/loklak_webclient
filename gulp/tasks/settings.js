'use strict';

var gulp   = require('gulp');
var http = require('http');
var fs = require('fs');

var url = 'http://localhost:9000/api/settings.json';

gulp.task('settings', function() {
	http.get(url, function(res) {
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
        var jsonRes = JSON.parse(body);
        console.log("Got response: ", jsonRes);
        fs.writeFile('custom_configFile_server.json', JSON.stringify(jsonRes, null, 4), function (err) {
        	if(err) throw err;
        	console.log('Config file saved.');
        });
    });
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});

    var AppSettings=JSON.parse(fs.readFileSync('custom_configFile.json', 'utf8'));
    var ServerSettings=JSON.parse(fs.readFileSync('custom_configFile_server.json', 'utf8'));
    console.log(AppSettings);
    console.log(ServerSettings);

    var settingsResult = {};
    for(var key in AppSettings) settingsResult[key] = AppSettings[key];
    for(var key in ServerSettings) settingsResult[key] = ServerSettings[key];

    console.log(settingsResult);
    fs.writeFile('custom_configFile.json', JSON.stringify(settingsResult, null, 4), function(err) {
        if (err) throw err;
        console.log('Updated config saved !');
    })

});