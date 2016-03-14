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
	      	{"id":"1959","project_name":"12bis sarl"},
	      	{"id":"4057","project_name":"CCE Banque de France"},
	      	{"id":"3576","project_name":"Mellow Yellow"},
	    ];
	
	return Q.fcall(function () {
	    return data;
	});
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;