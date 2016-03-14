var http = require("http");
var Q = require('q');

var params={
	timerBlacklist : 90,
	responseIsUnique : true,
	source: "claratact_host",
	search: {
		query : {
			missing : { field: "mappings.zabbix.id"}
		}
	},
	fields : ["id","hostname"],
	responses_source: "zabbix_host",
	responses_search: {
		query: {
			term: { "haveMapping" : false}
		}
	},
	responses_fields: ["id","hostname"],
	propositions: [
	    {
			source: "zabbix_host",
			field : "hostname",
			equalTo: "label",
			identifier : "hostname",
			identifierType : "label",
			search : {
				query: {
					term: { "haveMapping" : false}
				}
			}
	    }
    ]
}


function getParams(name){
	if(name in params){
		return params[name];
	}
	return null;
}


function resolve(id,response){}

// Params
exports.getParams = getParams;


// Fonctions
exports.resolve = resolve;