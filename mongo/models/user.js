var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../../custom_configFile.json');

// var WallSchema = new Schema({
//         profanity: Boolean,
//         images: Boolean,
//         videos: Boolean,
//         headerColour: String,
//         headerForeColour: String,
//         headerPosition: String,
//         layoutStyle: Number,
//         showStatistics: Boolean,
//         showLoklakLogo: Boolean,
//         showEventName: Boolean,
//         all: [String],
//         any: [String],
//         none: [String],
//         eventName: Number,
//         sinceDate: Date,
//         mainHashtagText: String,
//         mainHashtag: String,
//         id: String
// })

var UserSchema = new Schema({
  // screen_name: String,
  // oauth_token: String,
  // oauth_token_secret: String,
  // source_type: String,
  // apps: {
  //   wall: [WallSchema]
  // }
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String

});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, config.jwtsecret); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

mongoose.model('User', UserSchema);