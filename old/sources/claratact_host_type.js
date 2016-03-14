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
	      	{"id":1,"type":"serveur","label":"Serveur"},
	      	{"id":2,"type":"network","label":"Equipement réseau"},
	    ];
	
	return Q.fcall(function () {
	    return data;
	});
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;