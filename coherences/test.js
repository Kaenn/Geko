var http = require("http");
var Q = require('q');

var timer=90; // seconds
var reponseUnique=true;

// Get timer in seconds
function getTimer(){
	return timer;
}

function hasPropositionUnique(){
	return reponseUnique;
}

function getQueryElasticSearch(){
	return {
		"term" : { "isIncoherent" : true }
	};
}

function getInput(){
	return ["true","false"];
}

function getProposition(){
	return null;
}

function getProposition(){
	return null;
}

function getPropositionParam(){
	return null;
}

function resolve(id,response){
	/*var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/resolve.php?id='+id+"&response="+response,
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		if(res.statusCode==200){
			res.setEncoding('utf8');
			res.on('data', function (data) {
				
			});
		}
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();*/
}


function getData(){
	var deferred = Q.defer();
    
	var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/get.php',
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		if(res.statusCode==200){
			res.setEncoding('utf8');
			res.on('data', function (data) {
				deferred.resolve(JSON.parse(data));
			});
		}
	});

	req.on('error', function(e) {
		deferred.reject(e.message);
	});
	
	req.end();
	
	return deferred.promise;
}

function getDataPropositions(){
	var deferred = Q.defer();
    
	var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/getPropositions.php',
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		if(res.statusCode==200){
			res.setEncoding('utf8');
			res.on('data', function (data) {
				deferred.resolve(JSON.parse(data));
			});
		}
	});

	req.on('error', function(e) {
		deferred.reject(e.message);
	});
	
	req.end();
	
	return deferred.promise;
}


// Params
exports.getTimer = getTimer;
exports.getTimerMS = function(){ return getTimer()*100; }; // get timer in milliseconds
exports.hasPropositionUnique = hasPropositionUnique;


// Fonctions
exports.getQueryElasticSearch = getQueryElasticSearch;
exports.getInput = getInput;
exports.getProposition = getProposition;
exports.resolve = resolve;
exports.getData = getData;
exports.getDataPropositions = getDataPropositions;