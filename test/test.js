"use strict";

var fs = require('fs');

fs.exists('build/index.html', function (exists) {
	if(exists) {
		console.log("Success, Files exist");
	}
	else {
		console.log("Failed");
	}
});
