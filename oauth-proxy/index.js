// Demonstation of integration
var oauthshim = require('oauth-shim'),
    express = require('express'),
    request = require('request');
var config = require('../custom_configFile.json');
if (!config.twitterConsumerKey || !config.twitterConsumerSecret || !config.twitterCallbackUrl) {
    config.twitterConsumerKey = "placeholder";
    config.twitterConsumerSecret = "placeholder";
    config.twitterCallbackUrl = "placeholder";
}
var app = express();

// Set application to list on PORT
app.listen(config.oauthProxyPort);

console.log("OAuth Shim listening on " + config.oauthProxyPort);

// Create a key value list of {client_id => client_secret, ...}
var creds = {};

// Set credentials
creds[config.twitterConsumerKey] = config.twitterConsumerSecret;

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init(creds);

// Define a path where to put this OAuth Shim
app.all('/oauthproxy',
    oauthshim.interpret,
    customHandler,
    oauthshim.proxy,
    oauthshim.redirect,
    oauthshim.unhandled);


function customHandler(req, res, next) {

    // Check that this is a login redirect with an access_token (not a RESTful API call via proxy)
    if (req.oauthshim &&
        req.oauthshim.redirect &&
        req.oauthshim.data &&
        req.oauthshim.data.access_token &&
        req.oauthshim.options &&
        !req.oauthshim.options.path) {
        //The access token is of the form "oauth_token:oauth_token_secret@app_id". Need to separate
        var splitted = req.oauthshim.data.access_token.split(":");
        var oauth_token = splitted[0];
        var oauth_token_secret = splitted[1].split("@")[0];
        var userObject = {};
        userObject['screen_name'] = req.oauthshim.data.screen_name;
        userObject['oauth_token'] = oauth_token;
        userObject['oauth_token_secret'] = oauth_token_secret;
        userObject['source_type'] = "TWITTER";
        var requestJSON = JSON.stringify(userObject);   
        console.log(requestJSON);     
        //got it. Now send to backend
        request('http://localhost:9000/api/account.json?action=update&data=' + requestJSON, function(error, response, body) {
            console.log(requestJSON);
            if (!error && response.statusCode == 200) {
                console.log("user saved");
            } else {
                console.log("The user was not saved in loklak_server. Handle this error");
            }
        });
    }

    // Call next to complete the operation
    next();
}
