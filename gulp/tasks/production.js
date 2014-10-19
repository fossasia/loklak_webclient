'use strict';

var gulp        = require('gulp');
var runSequence = require('run-sequence');

gulp.task('prod', function(cb) {

  cb = cb || function() {};

  global.isProd = true;

  runSequence('clean', 'styles', 'images', 'views', 'browserify', cb);

});