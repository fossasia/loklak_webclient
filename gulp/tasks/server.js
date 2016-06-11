'use strict';

var config  = require('../config');
var http    = require('http');
var express = require('express');
var gulp    = require('gulp');
var gutil   = require('gulp-util');
var morgan  = require('morgan');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

require('../../mongo/models/db');
require('../../mongo/config/passport');

var routesApi = require('../../mongo/routes/index');

gulp.task('server', function() {

  var server = express();

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cookieParser());
  
  // error handlers
  // Catch unauthorised errors
  server.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401);
      res.json({"message" : err.name + ": " + err.message});
    }
  });

  // Initialise Passport before using the route middleware
  server.use(passport.initialize());

  // Use the API routes when path starts with /api
  server.use('/api', routesApi);

    //   var mock = {
    //     "screen_name": "makkleon",
    //     "oauth_token": "282563431-vXp71wR2DLlBSuY2XGLdgfe6c4jTLqjacjGn8tyt",
    //     "oauth_token_secret": "TwpffGJphpOz81rg0HrdL4MBw1Q801z73bxAomeVAo8cv",
    //     "source_type": "TWITTER",
    //     "servers": {
    //       "wall": [
    //         {
    //           "profanity": true,
    //           "images": true,
    //           "videos": false,
    //           "headerColour": "#3c8dbc",
    //           "headerForeColour": "#FFFFFF",
    //           "headerPosition": "Top",
    //           "layoutStyle": 1,
    //           "showStatistics": true,
    //           "showLoklakLogo": true,
    //           "showEventName": true,
    //           "all": [],
    //           "any": [],
    //           "none": [],
    //           "eventName": "1",
    //           "sinceDate": "2016-04-30T16:00:00.000Z",
    //           "mainHashtagText": "asd",
    //           "mainHashtag": "#asd",
    //           "id": "EyKbNu8Xb"
    //         }
    //       ]
    //     }
    //   };
  
  // Uncomment to log all requests to the console
  server.use(morgan('dev'));
  server.use(express.static(config.dist.root));

  // Serve index.html for all other routes to leave routing up to Angular
  server.use('/*', function(req, res) {
      res.sendFile('index.html', { root: 'build' });
  });

  // Start webserver if not already running
  var s = http.createServer(server);
  s.on('error', function(err){
    if(err.code === 'EADDRINUSE'){
      gutil.log('Development server is already started at port ' + config.serverport);
    }
    else {
      throw err;
    }
  });

  s.listen(config.serverport);

});