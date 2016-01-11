var http = require("http");
var Q = require('q');

var params={
	timerBlacklist : 90,
	responseIsUnique : true,
	source: "source1",
	search: {
		query : {
			missing : { field: "project_id"}
		}
	},
	fields : ["id","hostname"],
	responses_source: "sourceResponses1",
	responses_search: {},
	responses_fields: ["id","project_name"],
	propositions: [
	    {
			source: "source1",
			field : "zabbix.hostgroupName",
			fieldIdentifier : "id",
			search : {},
			equalTo: "label"
	    },
	    {
			source: "source1",
			field : "cacti.hostgroupName",
			fieldIdentifier : "id",
			search : {},
			equalTo: "label"
	    }
    ]
	
}


function getParams(name){
	if(name in params){
		return params[name];
	}
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

// Params
exports.getParams = getParams;


// Fonctions
exports.resolve = resolve;