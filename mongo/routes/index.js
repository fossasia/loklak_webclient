var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('../../custom_configFile.json');

var auth = jwt({
  secret: config.jwtsecret,
  userProperty: 'payload'
});
var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlMailer = require('../controllers/email');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.get('/send', ctrlMailer.send);
router.get('/verify', ctrlMailer.verify);

module.exports = router;
