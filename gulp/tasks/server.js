'use strict';

var config  = require('../config');
var http    = require('http');
var express = require('express');
var gulp    = require('gulp');
var morgan  = require('morgan');

gulp.task('server', function() {
  var server = express();

  // log all requests to the console
  server.use(morgan('dev'));
  server.use(express.static(config.dist.root));

  // Serve index.html for all routes to leave routing up to Angular
  server.all('/*', function(req, res) {
      res.sendFile('index.html', { root: 'build' });
  });

  // Start webserver if not already running
  if ( !global.serverRunning ) {
    http.createServer(server).listen(config.serverport, function () {
      global.serverRunning = true;
    });
  }
});