var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.register = function(req, res) {
  
  // Log in if found, else register
  passport.authenticate('local', function(err, user, info){
    var token;
    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }
    // If a user is found
    if(user){
        token = user.generateJwt();
        res.status(200);
        res.json({
            "token" : token
        });
    } else {
        // If user is not found
        var user = new User();
        user.name = req.body.email;
        user.email = req.body.email;
        user.isVerified = false;
        user.apps = {
            walls: []
        };

        user.setPassword(req.body.password);
        user.save(function(err) {
            var token;
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token" : token
            });
        });
    }
  })(req, res);

};

module.exports.login = function(req, res) {

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};
