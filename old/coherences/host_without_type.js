var http = require("http");
var Q = require('q');

var params={
	timerBlacklist : 90,
	responseIsUnique : true,
	source: "claratact_host",
	search: {
		query : {
			missing : { field: "type" }
		}
	},
	fields : ["id","hostname"],
	responses_source: "claratact_host_type",
	responses_search: {},
	responses_fields: ["type","label"],
	propositions: [
	    {
			source: "claratact_host",
			field : "id",
			value: "serveur",
			identifier : "id",
			identifierType : "id",
			search : {
				query: {
					"term": { "mappings.glpi.type" : "h"}
				}
			}
	    },
	    {
			source: "claratact_host",
			field : "id",
			value: "network",
			identifier : "id",
			identifierType : "id",
			search : {
				query: {
					"term": { "mappings.glpi.type" : "n"}
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