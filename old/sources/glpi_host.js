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
	        {"id":"12548","hostname":"ats-esxi-01","haveMapping":false},
	      	{"id":"874","hostname":"rep-ap3","haveMapping":false},
	      	{"id":"256","hostname":"gdfsmn-pa01-bat","haveMapping":false}
	    ];
	
	return Q.fcall(function () {
	    return data;
	});
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;