'use strict'

var express = require('express');
var morgan  = require('morgan');
var app = express();

//app.use(morgan('dev'));
app.use(express.static('build'));

app.all('/*', function(req, res) {
	console.log("this works!");
    res.sendFile('index.html', { root: 'build' });
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
app.use(require('connect-livereload')());