'use strict';

var config         = require('../config');
var gulp           = require('gulp');

// Views task
gulp.task('views', function() {

  // Put our index.html in the dist folder
  gulp.src('app/index.html')
    .pipe(gulp.dest(config.dist.root));

});