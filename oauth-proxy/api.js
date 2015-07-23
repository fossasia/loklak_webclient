var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../custom_configFile.json');
var shortid = require('shortid');
function getData(user, callback){
	request(config.apiUrl + 'account.json?screen_name=' + user, callback);
}

//LIST
router.get('/:user/:app', function(req, res){
	getData(req.params.user, function(error, response, body) {
		var data = JSON.parse(response.body).accounts[0];
		if(data.apps[req.params.app])
	    	res.jsonp(data.apps[req.params.app]);
	    else
	    	res.jsonp([]);
	});
});

//READ
router.get('/:user/:app/:id', function(req, res){
	getData(req.params.user, function(error, response, body) {
		var data = JSON.parse(response.body).accounts[0];
		if(data.apps[req.params.app]){
			for (var i = 0; i < data.apps[req.params.app].length; i++) {
				if(data.apps[req.params.app][i].id == req.params.id){
					return res.jsonp(data.apps[req.params.app][i]);
				}
			}
	    	res.jsonp({});
		}
	    else{
	    	res.jsonp({});
	    }
	});
});

//CREATE
router.post('/:user/:app', function(req, res){
	var newWall = req.body;
	getData(req.params.user, function(error, response, body) {	
		var appData = JSON.parse(response.body).accounts[0].apps;
		if(!appData[req.params.app]){
			appData[req.params.app] = [];
		}
		newWall.id = shortid.generate();
		appData[req.params.app].push(newWall);
		var dataToSend = {
			screen_name: req.params.user,
			apps: appData
		}
		request(config.apiUrl + 'account.json?action=update&data=' + encodeURIComponent(JSON.stringify(dataToSend)), function(error, response, body) {
		    console.log(response.body);
		    res.json({id: newWall.id});
		});
	});
});

//DELETE
router.delete('/:user/:app/:id', function(req, res){
	getData(req.params.user, function(error, response, body) {
		var appData = JSON.parse(response.body).accounts[0].apps;
		if(!appData[req.params.app]){
			appData[req.params.app] = [];
		}
		var found = false;
		for (var i = 0; i < appData[req.params.app].length; i++) {
			if(appData[req.params.app][i].id == req.params.id){
				found = true;
				appData[req.params.app].splice(i, 1)
				var dataToSend = {
					screen_name: req.params.user,
					apps: appData
				}
				request(config.apiUrl + 'account.json?action=update&data=' + encodeURIComponent(JSON.stringify(dataToSend)), function(error, response, body) {
				    console.log(response.body);
				    return res.json({status: "OK"});
				});
			}
		}
		if(found == false){
			res.json({status: "ERROR"});
		}

	});
});

//UPDATE
router.put('/:user/:app/:id', function(req, res){
	getData(req.params.user, function(error, response, body) {
		var appData = JSON.parse(response.body).accounts[0].apps;
		if(!appData[req.params.app]){
			appData[req.params.app] = [];
		}
		var found = false;
		for (var i = 0; i < appData[req.params.app].length; i++) {
			if(appData[req.params.app][i].id == req.params.id){
				found = true;
				appData[req.params.app][i] = req.body;
				var dataToSend = {
					screen_name: req.params.user,
					apps: appData
				}
				request(config.apiUrl + 'account.json?action=update&data=' + encodeURIComponent(JSON.stringify(dataToSend)), function(error, response, body) {
				    console.log(response.body);
				    return res.json({status: "OK"});
				});
			}
		}
		if(found == false){
			res.json({status: "ERROR"});
		}

	});
});

module.exports = router;