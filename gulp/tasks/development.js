'use strict';

var gulp        = require('gulp');
var runSequence = require('run-sequence');

gulp.task('dev', ['settings', 'clean'], function(cb) {

  cb = cb || function() {};

  global.isProd = false;

  runSequence(['styles', 'minify-css', 'photoswipe-icons', 'images', 'fonts', 'views', 'browserify', 'admin-js'], 'watch', 'oauth', cb);

});