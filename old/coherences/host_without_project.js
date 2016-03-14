var http = require("http");
var Q = require('q');

var params={
	timerBlacklist : 90,
	responseIsUnique : true,
	source: "claratact_host",
	search: {
		query : {
			or: [
			    {
			    	missing : { field: "project_id"}
			    },
			    {
			    	term: { "project_id" : 0}
			    }
			]
		}
	},
	fields : ["id","hostname"],
	responses_source: "claratact_project",
	responses_search: {},
	responses_fields: ["id","project_name"],
	propositions: [
	    /*{
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
	    }*/
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