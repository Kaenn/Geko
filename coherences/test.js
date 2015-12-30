var http = require("http");

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

function resolve(id,response){
	var options = {
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
	
	req.end();
}

exports.getQueryElasticSearch = getQueryElasticSearch;
exports.getInput = getInput;
exports.getProposition = getProposition;
exports.resolve = resolve;