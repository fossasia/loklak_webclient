'use strict';

var gulp            = require('gulp'),
    gulpif          = require('gulp-if'),
    runSequence     = require('run-sequence'),
    karma           = require('gulp-karma'),
    protractor      = require('gulp-protractor').protractor,
    webdriver       = require('gulp-protractor').webdriver,
    webdriverUpdate = require('gulp-protractor').webdriver_update,
    jshint          = require('gulp-jshint'),
    browserify      = require('browserify'),
    source          = require('vinyl-source-stream'),
    streamify       = require('gulp-streamify'),
    uglifyify       = require('uglifyify'),
    sass            = require('gulp-sass'),
    imagemin        = require('gulp-imagemin'),
    pngcrush        = require('imagemin-pngcrush'),
    rename          = require('gulp-rename'),
    ngAnnotate      = require('browserify-ngannotate'),
    templateCache   = require('gulp-angular-templatecache'),
    refresh         = require('gulp-livereload'),
    lrserver        = require('tiny-lr')(),
    morgan          = require('morgan'),
    express         = require('express'),
    livereload      = require('connect-livereload'),
    livereloadport  = 35728,
    serverport      = 3000,
    isProd          = false;

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
  Gulp Development/Production Tasks
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

  if ( isProd ) {
    b.transform({
      global: true
    }, uglifyify);
  }

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
          .pipe(sass({
            style: isProd ? 'compressed' : 'expanded',
            onError: function(e) { console.log(e); }
          }))
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('build/css/'))
          .pipe(refresh(lrserver));

});

// Images task
gulp.task('images', function() {

  // Run imagemin task on all images
  return gulp.src('app/images/**/*')
          .pipe(imagemin({
              progressive: true,
              svgoPlugins: [{removeViewBox: false}],
              use: [pngcrush()]
          }))
          .pipe(gulp.dest('build/images'));

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

  isProd = false;

  // Start webserver if not already running
  try {
    server.listen(serverport);
  } catch(e) {
    console.log('Server running.');
  }
  // Start live reload
  lrserver.listen(livereloadport);

  // Run all tasks once
  runSequence('styles', 'views', 'browserify');

  // Then, run the watch task to keep tabs on changes
  gulp.start('watch');

});

// Deploy task
gulp.task('deploy', function() {

  // Deploy to your hosting setup

});

// Production task
gulp.task('prod', function() {

  isProd = true;

  // Run all tasks
  runSequence('styles', 'images', 'views', 'browserify', 'deploy');

});

/************************************************
  Gulp Testing Tasks
 ***********************************************/

// Unit test task
gulp.task('unit', function() {

  // Nonsensical source to fall back to files listed in karma.conf.js,
  // see https://github.com/lazd/gulp-karma/issues/9
  return gulp.src('./thisdoesntexist')
          .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'run'
          }))
          .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
          });

});

// Webdriver tasks for Protractor testing
gulp.task('webdriver-update', webdriverUpdate);
gulp.task('webdriver', webdriver);

// Protractor test task
gulp.task('protractor', ['webdriver-update', 'webdriver'], function() {

  return gulp.src('test/e2e/**/*.js')
          .pipe(protractor({
              configFile: 'test/protractor.conf.js'
          }))
          .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
          });

});

// Run all tests at once
gulp.task('test', function() {

  // Start webserver if not already running
  try {
    server.listen(serverport);
  } catch(e) {
    console.log('Server running.');
  }

  // Run both unit and e2e tests
  runSequence('unit', 'protractor');

});
