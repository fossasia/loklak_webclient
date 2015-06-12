'use strict';

var config = require('../config');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('oauth', function(cb) {
	var init = true;
	return nodemon({
		script: config.oauth_proxy.index_file
	}).on('start', function() {
		if (init)  {
			cb();
		}
		
		init = false;
	});
});