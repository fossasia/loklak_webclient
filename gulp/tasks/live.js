'use strict';

var gulp        = require('gulp');
var runSequence = require('run-sequence');

gulp.task('live', ['settings', 'clean'], function(cb) {

  cb = cb || function() {};

  global.isProd = true;

  runSequence(['styles', 'minify-css', 'photoswipe-icons', 'images', 'fonts', 'views', 'browserify', 'admin-js'], 'gzip', ['server', 'oauth'], cb);

});