'use strict'

var express = require('express');
var morgan  = require('morgan');
var app = express();
var ejs = require('ejs');
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
var Twitter = require('twitter');
app.set('view engine', 'ejs');  
app.configure(function () {
    app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new TwitterStrategy({
    consumerKey: '4DdE88xIW3r3xcRk8Z0JXJNqo',
    consumerSecret: 'ctzmTzpCLZQ3JD8eTdqzeWwXSr8Cxi0GvACmrPaSfbvxYnloVZ',
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
  	process.nextTick(function () {
  		console.log(token);
  		console.log(tokenSecret);
      profile.token = token;
      profile.tokenSecret = tokenSecret;
      return done(null, profile);
    });
  }
));

// app.all('/*', function(req, res) {
// 	console.log("this works!");
//     res.sendFile('index.html', { root: 'build' });
// });

app.get('/account', ensureAuthenticated, function (req, res){
 //  console.log(req.user);
	// client.post('statuses/update', {status: 'I Love Loklak!'},  function(error, tweet, response){
	//   if(error) {res.send(error)};
	//   console.log(tweet);  // Tweet body. 
	//   res.send(response);  // Raw response object. 
	// });
  res.render('index');
});
app.get('/auth/twitter', passport.authenticate('twitter'), function (req, res) { req.logout(); });
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '' }), function (req, res) { res.redirect('/account'); });

app.post('/newTweet', ensureAuthenticated, function (req, res){
  console.log(req.body.tweetbody);
  var client = new Twitter({
        consumer_key: '4DdE88xIW3r3xcRk8Z0JXJNqo',
        consumer_secret: 'ctzmTzpCLZQ3JD8eTdqzeWwXSr8Cxi0GvACmrPaSfbvxYnloVZ',
        access_token_key: req.user.token,
        access_token_secret: req.user.tokenSecret
      });
  client.post('statuses/update', {status: req.body.tweetbody},  function(error, tweet, response){
    if(error) {res.send(error)};
    console.log(tweet);  // Tweet body. 
    res.send(response);  // Raw response object. 
  });
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
app.use(require('connect-livereload')());

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}