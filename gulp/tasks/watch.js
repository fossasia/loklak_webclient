'use strict';

var config        = require('../config');
var gulp          = require('gulp');

gulp.task('watch', ['browserSync', 'server'], function() {

  gulp.watch(config.scripts.src, ['lint', 'browserify']);
  gulp.watch(config.styles.src,  ['styles']);
  gulp.watch(config.images.src,  ['images', 'reload']);
  gulp.watch(config.views.watch, ['views']);

});