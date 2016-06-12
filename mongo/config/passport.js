var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var config = require('../../custom_configFile.json');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new TwitterStrategy({
    consumerKey     : config.twitterConsumerKey,
    consumerSecret  : config.twitterConsumerSecret,
    callbackURL     : config.twitterCallbackUrl
}, function(token, tokenSecret, profile, done) {
    console.log(profile);
    
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(function() {
        
        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

            // error connecting to the database
            if (err) return done(err);
            
            // if the user is found then log them in
            if (user) {
                return done(null, user); // user found, return that user
            } else {
                // if there is no user, create them
                var newUser                 = new User();
                
                // set all of the user data that we need
                newUser.twitter.id          = profile.id;
                newUser.twitter.token       = token;
                newUser.twitter.username    = profile.username;
                newUser.twitter.displayName = profile.displayName;
                newUser.twitter.lastStatus = profile._json.status.text;

                
                // save our user into the database
                newUser.save(function(err) {
                    if (err)
                    throw err;
                    return done(null, newUser);
                });
            }
        });
    });
}));



