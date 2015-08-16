var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../custom_configFile.json');
var shortid = require('shortid');

/*
 * Convert obj's prop & value to GET request params
 */
function serialize(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function getData(user, callback) {
    request(config.apiUrl + 'account.json?screen_name=' + user, callback);
}

function getAuthorizedData(servlet, paramsObj, callback) {
    
}

function updateData(authData, data, callback) {
    var dataToSend = authData;
    dataToSend.apps = data;
    console.log(JSON.stringify(dataToSend));
    request.post({
            url: config.apiUrl + 'account.json',
            form: {
                action: 'update',
                data: JSON.stringify(dataToSend)
            }
        },
        callback
    );
}



/*
 * Middleware for authorizing request
 * This is a async method call so always provide a callback to process the result
 * An authorized req requires 3 fields for now_ screen_name, oauth, secret
 */
var isAuthorized = function(req, res, next) {

	function parseAccessToken(accessToken) {
	    var splitted = accessToken.split(":");
	    var oauth_token = splitted[0];
	    var oauth_token_secret = splitted[1].split("@")[0];
	    var userObject = {};
	    userObject['oauth_token'] = oauth_token;
	    userObject['oauth_token_secret'] = oauth_token_secret;
	    return userObject;
	}

    if (!(req.get('x-screen-name')) || (!(req.get('x-access-token')))) {
        res.end("Access unauthorized");
        return;
    }

    var userObject = parseAccessToken(req.get('x-access-token'));

    var params = {
        "screen_name" : req.get('x-screen-name'),
        "token" : userObject.oauth_token,
        "secret" : userObject.oauth_token_secret
    };

    request(config.apiUrl + 'account.json?' + serialize(params), function(error, response, body) {  
        var data = JSON.parse(response.body).accounts[0];
        if (data.oauth_token === params.token && data.oauth_token_secret === params.secret) {
        	req.accountData = data;
            next();
        } else {
            res.end("Access unauthorized");
        }    
    });
}

/* 
 * Authorized API, an example for the use case of the middleware above
 */
router.get('/authorized?', isAuthorized, function(req, res) {
	res.jsonp(req.accountData);
    // var cb = function(responseState, response) {
    //     if (responseState) {
    //         res.jsonp(response);  
    //     } else {
    //         res.send("Access unauthorized");
    //     }
    // }
    
    // isAuthorized(req, res, cb);
})

/* Wall API */
//LIST
router.get('/:user/:app', isAuthorized, function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var data = JSON.parse(response.body).accounts[0];
        var authData = {};
        authData.oauth_token = data.oauth_token;
        authData.oauth_token_secret = data.oauth_token_secret;
        authData.screen_name = data.screen_name;
        if (data.apps) {
            if (data.apps[req.params.app]) {
                //Migration to new system
                if (data.apps[req.params.app].walls) {
                    //clear everything.
                    updateData(authData, {}, function() {
                        res.jsonp([]);
                    });
                } else {
                    res.jsonp(data.apps[req.params.app]);
                }
            } else {
                res.jsonp([]);
            }
        } else {
            //clear everything.
            updateData(authData, {}, function() {
                res.jsonp([]);
            });
        }
    });
});

//READ (Publicly accessible, middleware not required)
router.get('/:user/:app/:id', function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var data = JSON.parse(response.body).accounts[0];
        if (data.apps[req.params.app]) {
            for (var i = 0; i < data.apps[req.params.app].length; i++) {
                if (data.apps[req.params.app][i].id == req.params.id) {
                    return res.jsonp(data.apps[req.params.app][i]);
                }
            }
            res.jsonp({});
        } else {
            res.jsonp({});
        }
    });
});

//CREATE
router.post('/:user/:app', isAuthorized, function(req, res) {
    var newWall = req.body;
    getData(req.params.user, function(error, response, body) {
    	var responseData = JSON.parse(response.body);
        var appData = responseData.accounts[0].apps;
        var authData = {};
        authData.oauth_token = responseData.accounts[0].oauth_token;
        authData.oauth_token_secret = responseData.accounts[0].oauth_token_secret;
        authData.screen_name = responseData.accounts[0].screen_name;
        if(!appData){
            appData = {};
        }
        if (!appData[req.params.app]) {
            appData[req.params.app] = [];
        }
        newWall.id = shortid.generate();
        appData[req.params.app].push(newWall);
        //console.log(newWall.id);
        updateData(authData, appData, function(error, response, body) {
            return res.json({
                id: newWall.id
            });
        });
    });
});

//DELETE
router.delete('/:user/:app/:id', isAuthorized, function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var responseData = JSON.parse(response.body);
        var appData = responseData.accounts[0].apps;
        var authData = {};
        authData.oauth_token = responseData.accounts[0].oauth_token;
        authData.oauth_token_secret = responseData.accounts[0].oauth_token_secret;
        authData.screen_name = responseData.accounts[0].screen_name;
        console.log(authData);
        if (!appData[req.params.app]) {
            appData[req.params.app] = [];
        }
        var found = false;
        for (var i = 0; i < appData[req.params.app].length; i++) {
            if (appData[req.params.app][i].id == req.params.id) {
                found = true;
                appData[req.params.app].splice(i, 1)
                var dataToSend = {
                    screen_name: req.params.user,
                    apps: appData
                }
                updateData(authData, appData, function(error, response, body) {
                    console.log(response.body);
                    return res.json({
                        status: "OK"
                    });
                });
            }
        }
        if (found == false) {
            res.json({
                status: "ERROR"
            });
        }

    });
});

//UPDATE
router.put('/:user/:app/:id', isAuthorized, function(req, res) {
    getData(req.params.user, function(error, response, body) {
    	var responseData = JSON.parse(response.body);
        var appData = responseData.accounts[0].apps;
        var authData = {};
        authData.oauth_token = responseData.accounts[0].oauth_token;
        authData.oauth_token_secret = responseData.accounts[0].oauth_token_secret;
        authData.screen_name = responseData.accounts[0].screen_name;
        if (!appData[req.params.app]) {
            appData[req.params.app] = [];
        }
        var found = false;
        for (var i = 0; i < appData[req.params.app].length; i++) {
            if (appData[req.params.app][i].id == req.params.id) {
                found = true;
                appData[req.params.app][i] = req.body;
                var dataToSend = {
                    screen_name: req.params.user,
                    apps: appData
                }
                updateData(authData, appData, function(error, response2, body) {
                    //console.log(response2.body);
                    return res.json(JSON.parse(response2.body).accounts[0].apps[req.params.app][i]);
                });
            }
        }
        if (found == false) {
            res.json({
                status: "ERROR"
            });
        }

    });
});


module.exports = router;
