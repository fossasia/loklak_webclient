/*jslint node: true */
/*archiebnz linted 1/1*/
var fs = require('fs');

fs.exists('build/index.html', function (exists) {
    "use strict";
	if (exists) {
		console.log("Success, Files exist");
	} else { console.log("Failed"); }
});
