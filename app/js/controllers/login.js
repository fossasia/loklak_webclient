'use strict';

var controllersModule = require('./_index');

function LoginCtrl($scope, $auth) {
	
	$scope.authenticate = function(provider) {
    	$auth.authenticate(provider);
    };

}

controllersModule.controller('AboutCtrl', AboutCtrl);