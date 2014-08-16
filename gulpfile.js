'use strict';

var gulp           = require('gulp'),
    runSequence    = require('run-sequence'),
    jshint         = require('gulp-jshint'),
    browserify     = require('browserify'),
    source         = require('vinyl-source-stream'),
    streamify      = require('gulp-streamify'),
    uglifyify      = require('uglifyify'),
    sass           = require('gulp-sass'),
    rename         = require('gulp-rename'),
    ngAnnotate     = require('browserify-ngannotate'),
    templateCache  = require('gulp-angular-templatecache'),
    refresh        = require('gulp-livereload'),
    lrserver       = require('tiny-lr')(),
    morgan         = require('morgan'),
    express        = require('express'),
    livereload     = require('connect-livereload'),
    livereloadport = 35729,
    serverport     = 3000;

/************************************************
  Web Server
 ***********************************************/

var server = express();
// log all requests to the console
server.use(morgan('dev'));
// Add live reload
server.use(livereload({port: livereloadport}));
server.use(express.static('./build'));
// Serve index.html for all routes to leave routing up to Angular
server.all('/*', function(req, res) {
    res.sendFile('index.html', { root: 'build' });
});

/************************************************
  Gulp Tasks
 ***********************************************/

// JSHint task
gulp.task('lint', function() {

  return gulp.src(['app/js/**/*.js', '!app/js/templates.js'])
          .pipe(jshint())
          .pipe(jshint.reporter('default'));

});

// Browserify task
gulp.task('browserify', function() {

  var b = browserify({
    basedir: '.',
    entries: './app/js/main.js',
    debug: true,
    insertGlobals: true
  });

  b.transform({
    global: true
  }, ngAnnotate);

  b.transform({
    global: true
  }, uglifyify);

  return b.bundle()
          .pipe(source('main.js'))
          .pipe(streamify(rename({suffix: '.min'})))
          .pipe(gulp.dest('build/js'))
          .pipe(refresh(lrserver));

});

// Styles task
gulp.task('styles', function() {

  return gulp.src('app/styles/main.scss')
          // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
          .pipe(sass({style: 'compressed', onError: function(e) { console.log(e); } }))
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('build/css/'))
          .pipe(refresh(lrserver));

});

// Views task
gulp.task('views', function() {

  // Put our index.html in the dist folder
  gulp.src('app/index.html')
    .pipe(gulp.dest('build/'));

  // Process any other view files from app/views
  return gulp.src('app/views/**/*.html')
          .pipe(templateCache({
            standalone: true
          }))
          .pipe(gulp.dest('app/js'))
          .pipe(refresh(lrserver));

});

gulp.task('watch', function() {

  // Watch our scripts
  gulp.watch(['app/js/**/*.js'],[
    'lint',
    'browserify'
  ]);
  // Watch our styles
  gulp.watch(['app/styles/**/*.scss'], [
    'styles'
  ]);
  // Watch our views
  gulp.watch(['app/index.html', 'app/views/**/*.html'], [
    'views'
  ]);

});

// Dev task
gulp.task('dev', function() {

  // Start webserver
  server.listen(serverport);
  // Start live reload
  lrserver.listen(livereloadport);

  // Run all tasks once
  runSequence('styles', 'views', 'browserify');

  // Then, run the watch task to keep tabs on changes
  gulp.start('watch');

});
