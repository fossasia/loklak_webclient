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
var ctrlWalls = require('../controllers/walls');

// profile
// router.get('/profile', auth, ctrlProfile.profileRead);

// WALL API
// router.get('/walls', auth, ctrlWalls.wallReadById);

// WALL API
router.get   ('/:user/:app/:id', ctrlWalls.getWallById);
router.get   ('/:user/:app', auth, ctrlWalls.getUserWalls);
router.post  ('/:user/:app', auth, ctrlWalls.createWall);
router.put   ('/:user/:app/:id', auth, ctrlWalls.updateWall);
router.delete('/:user/:app/:id', auth, ctrlWalls.deleteWall);

// AUTH
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// EMAIL CONFIRMATIONS
router.get('/send', ctrlMailer.send);
router.get('/verify', ctrlMailer.verify);

module.exports = router;
