var http = require("http");
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
    
	var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/getReal.php',
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
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;