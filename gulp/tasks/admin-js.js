'use strict';

var config = require('../config');
var gulp = require('gulp');

gulp.task('admin-js', function() {
  return gulp.src(config.adminJS.src)
    .pipe(gulp.dest(config.adminJS.dest));
});