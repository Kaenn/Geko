var fs = require("fs");
var Q = require('q');

var params={
	"refreshTimer" : 9000
}


function getParams(name){
	if(name in params){
		return params[name];
	}
	return null;
}



function getDataFromSource(){
	var deferred = Q.defer();
    
	var data=[
	        {"id":"10010000000735399","hostname":"ats-esxi-01","haveMapping":false},
	      	{"id":"100100000007353","hostname":"monara-pa20","haveMapping":false},
	      	{"id":"100100000007587","hostname":"gdfsmn-pa01-bat","haveMapping":false}
	    ];
	
	return Q.fcall(function () {
	    return data;
	});
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;