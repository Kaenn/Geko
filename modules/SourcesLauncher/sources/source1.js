var Q = require('q');

var refreshTimer=9000;

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
exports.refreshTimer = refreshTimer;

// Fonctions
exports.getDataFromSource = getDataFromSource;