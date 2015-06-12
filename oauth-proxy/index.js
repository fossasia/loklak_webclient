    // Demonstation of integration
var oauthshim = require('oauth-shim'),
	express = require('express');
var config = require('../custom_configFile.json');
if(!config.twitterConsumerKey || !config.twitterConsumerSecret || !config.twitterCallbackUrl){
    config.twitterConsumerKey = "placeholder";
    config.twitterConsumerSecret = "placeholder";
    config.twitterCallbackUrl = "placeholder";
}
var app = express();

// Set application to list on PORT
app.listen(config.oauthProxyPort);

console.log("OAuth Shim listening on "+ config.oauthProxyPort);

// Create a key value list of {client_id => client_secret, ...}
var creds = {};

// Set credentials
creds[config.twitterConsumerKey] = config.twitterConsumerSecret;

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init(creds);

// Define a path where to put this OAuth Shim
app.all('/oauthproxy', oauthshim);