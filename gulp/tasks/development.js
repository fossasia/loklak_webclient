'use strict';

var gulp        = require('gulp');
var runSequence = require('run-sequence');

gulp.task('dev', function(cb) {

  cb = cb || function() {};

  global.isProd = false;

  runSequence('clean', 'styles', 'images', 'views', 'browserify', 'watch', cb);

});