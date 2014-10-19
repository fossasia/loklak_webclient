'use strict';

var config     = require('../config');
var changed    = require('gulp-changed');
var gulp       = require('gulp');
var gulpif     = require('gulp-if');
var imagemin   = require('gulp-imagemin');

gulp.task('images', function() {

  var dest = config.images.dest;

  return gulp.src(config.images.src)
    .pipe(changed(dest)) // Ignore unchanged files
    .pipe(gulpif(global.isProd, imagemin()))    // Optimize
    .pipe(gulp.dest(dest));

});