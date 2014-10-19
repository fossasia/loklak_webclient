'use strict';

var gulp        = require('gulp');
var browserSync = require('browser-sync');

gulp.task('reload', function() {

  browserSync.reload();

});