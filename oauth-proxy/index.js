var oauthshim = require('oauth-shim'),
    express = require('express'),
    api = require('./api.js'),
    bodyParser = require('body-parser'),
    request = require('request');
var config = require('../custom_configFile.json');
if (!config.twitterConsumerKey || !config.twitterConsumerSecret || !config.twitterCallbackUrl) {
    config.twitterConsumerKey = "placeholder";
    config.twitterConsumerSecret = "placeholder";
    config.twitterCallbackUrl = "placeholder";
}
var app = express();
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({
    limit: '50mb'
}));
// Set application to list on PORT
app.listen(config.oauthProxyPort);

app.all('*', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Origin", config.domain);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-access-token, x-screen-name");
    next();
});

console.log("OAuth Shim listening on " + config.oauthProxyPort);

app.get('/updateData', function(req, res) {
    request(config.apiUrl + 'account.json?action=update&data=' + encodeURIComponent(req.query.data), function(error, response, body) {
        console.log(response.body);
        res.status(response.statusCode).jsonp({
            ok: "ok"
        });
    });
});

app.get('/getData', function(req, res) {
    request(config.apiUrl + 'account.json?screen_name=' + req.query.screen_name, function(error, response, body) {
        console.log(response.body);
        res.jsonp(JSON.parse(response.body));
    });
});

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

/*RESTful routes for apps */
app.use('/', api);

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
        //got it. Now send to backend
        //but wait!! We need to get the current data from the backend first and then update it with the new data
        request(config.apiUrl + 'account.json?screen_name=' + userObject.screen_name, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var responseData = JSON.parse(response.body);
                if (responseData.accounts.length == 0) {
                    console.log("new user!");
                } else {
                    userObject['apps'] = responseData.accounts[0].apps;
                    // userObject.oauth_token = responseData.accounts[0].oauth_token;
                    // userObject.oauth_token_secret = responseData.accounts[0].oauth_token_secret;
                }
                var requestJSON = JSON.stringify(userObject);
                request.post({
                        url: config.apiUrl + 'account.json',
                        form: {
                            action: 'update',
                            data: requestJSON
                        }
                    },
                    function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log("user saved");
                        } else {
                            console.log("The user was not saved in loklak_server. Handle this error");
                        }
                    }
                );
            }
        });
    }

    // Call next to complete the operation
    next();
}
