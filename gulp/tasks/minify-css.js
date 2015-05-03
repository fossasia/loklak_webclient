'use strict';

var config = require('../config');
var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  return gulp.src(config.cssstyles.src)
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest(config.cssstyles.dest));
});