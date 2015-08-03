var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../custom_configFile.json');
var shortid = require('shortid');

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

function updateData(user, data, callback) {
    var dataToSend = {
        screen_name: user,
        apps: data
    }
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

/* Wall API */

/* Authorized Search API */
router.get('/authorized?', function(req, res) {
    var params = req.query;
    if (params.servlet === "account" && params.screen_name) {
        var servlet = params.servlet;
        var token = params.oauth_token;
        var secret = params.oauth_token_secret
        delete(params.servlet); 
        delete(params.oauth_token); 
        delete(params.oauth_token_secret);

        request(config.apiUrl + servlet + '.json?' + serialize(params), function(error, response, body) {  
            var data = JSON.parse(response.body).accounts[0];
            if (data.oauth_token === token && data.oauth_token_secret === secret) {
                res.jsonp(data);    
            } else {
                res.send("Access unauthorized");
            }    
        });
    }
})

//LIST
router.get('/:user/:app', function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var data = JSON.parse(response.body).accounts[0];
        if (data.apps) {
            if (data.apps[req.params.app]) {
                //Migration to new system
                if (data.apps[req.params.app].walls) {
                    //clear everything.
                    updateData(req.params.user, {}, function() {
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
            updateData(req.params.user, {}, function() {
                res.jsonp([]);
            });
        }
    });
});

//READ
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
router.post('/:user/:app', function(req, res) {
    var newWall = req.body;
    getData(req.params.user, function(error, response, body) {
        var appData = JSON.parse(response.body).accounts[0].apps;
        if(!appData){
            appData = {};
        }
        if (!appData[req.params.app]) {
            appData[req.params.app] = [];
        }
        newWall.id = shortid.generate();
        appData[req.params.app].push(newWall);
        console.log(newWall.id);
        updateData(req.params.user, appData, function(error, response, body) {
            console.log(response.body);
            return res.json({
                id: newWall.id
            });
        });
    });
});

//DELETE
router.delete('/:user/:app/:id', function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var appData = JSON.parse(response.body).accounts[0].apps;
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
                updateData(req.params.user, appData, function(error, response, body) {
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
router.put('/:user/:app/:id', function(req, res) {
    getData(req.params.user, function(error, response, body) {
        var appData = JSON.parse(response.body).accounts[0].apps;
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
                updateData(req.params.user, appData, function(error, response2, body) {
                    console.log(response2.body);
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
