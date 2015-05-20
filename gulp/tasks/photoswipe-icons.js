'use strict';

var config      = require('../config');
var changed     = require('gulp-changed');
var gulp        = require('gulp');
var gulpif      = require('gulp-if');
var imagemin    = require('gulp-imagemin');
var browserSync = require('browser-sync');

gulp.task('photoswipe-icons', function() {

  return gulp.src(config.photoswipeicons.src)
    .pipe(changed(config.photoswipeicons.dest)) // Ignore unchanged files
    .pipe(gulp.dest(config.photoswipeicons.dest))
    .pipe(gulpif(browserSync.active, browserSync.reload({ stream: true, once: true })));

});