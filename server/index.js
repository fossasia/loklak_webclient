'use strict'
var config = require('../custom_configFile.json');
if(!config.twitterConsumerKey || !config.twitterConsumerSecret || !config.twitterCallbackUrl){
    config.twitterConsumerKey = "placeholder";
    config.twitterConsumerSecret = "placeholder";
    config.twitterCallbackUrl = "placeholder";
}
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var app = express();
var ejs = require('ejs');
var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy;
var Twitter = require('twitter');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(require('path').resolve('.', 'build')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new TwitterStrategy({
        consumerKey: config.twitterConsumerKey,
        consumerSecret: config.twitterConsumerSecret,
        callbackURL: config.twitterCallbackUrl
    },
    function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
            console.log(token);
            console.log(tokenSecret);
            profile.token = token;
            profile.tokenSecret = tokenSecret;
            return done(null, profile);
        });
    }
));

app.get('/account', ensureAuthenticated, function(req, res) {
    //  console.log(req.user);
    // client.post('statuses/update', {status: 'I Love Loklak!'},  function(error, tweet, response){
    //   if(error) {res.send(error)};
    //   console.log(tweet);  // Tweet body. 
    //   res.send(response);  // Raw response object. 
    // });
    res.render('index');
});
app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
    req.logout();
});
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: ''
}), function(req, res) {
    res.redirect('/account');
});

app.post('/newTweet', ensureAuthenticated, function(req, res) {
    console.log(req.body.tweetbody);
    var client = new Twitter({
        consumer_key: config.twitterConsumerKey,
        consumer_secret: config.twitterConsumerSecret,
        access_token_key: req.user.token,
        access_token_secret: req.user.tokenSecret
    });
    client.post('statuses/update', {
        status: req.body.tweetbody
    }, function(error, tweet, response) {
        if (error) {
            res.send(error)
        };
        console.log(tweet); // Tweet body. 
        res.send(response); // Raw response object. 
    });
})

var server = app.listen(3001, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("Auth failed");
}

//this should always be after all the express routes have been declared.
//it serves the angular app
app.get('*', function(req, res) {
    console.log(__dirname);
    res.sendFile('index.html', {
        root: require('path').resolve('.', 'build')
    });
});
