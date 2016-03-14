var http = require("http");
var Q = require('q');

var params={
	timerBlacklist : 90, // Time in blacklist after resolve an incoherence (in seconde)
	
	search_desc : {
		request : {
			type : "search", // type of search
			params : {
				index : "source", // index for search,
				type : "claratact_host",
				body : { // body for research
					query : {
						exists : { field: "mappings.glpi.id"}
					}
				},
				idField : "id",  // field to use like an id
				labelField : "hostname",  // field to use like a label
			},
			checks : { // Check to add after research
				"mappings.glpi.id" : {
					"type" : "length",
					"check" : {"gt" : 1}
				}
			}
		},
	},
	
	
	responses :{
		responseIsUnique : true, // If resposne is unique add response in blacklist after resolve
		request : [{
			type : "query", // type of search
			params : {
				index : "source", // index for search,
				type : "glpi_host",
				body : { // body for research
					query: {
						term: { "haveMapping" : false}
					}
				},
				idField : "id",  // field to use like an id
				labelField : "hostname",  // field to use like a label
			},
		}]
	},
	
	propositions: [
	    {
	    	request : [{
	    		type : "search",
		    	params : {
		    		index : "source",
		    		type : "glpi_host",
		    		body : {
						query: {
							term: { "haveMapping" : false}
						}
					},
	    			idField : null,  // field to use like an id
	    			labelField : "hostname",  // field to use like a label
		    	}
	    	}]
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