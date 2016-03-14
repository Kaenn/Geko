var http = require("http");
var Q = require('q');
var searchUtility = require('../modules/API/modele/searchUtility');
var ElasticSearchParser = require('../modules/API/controler/ElasticSearchParser');


var params={
	timerBlacklist : 90, // Time in blacklist after resolve an incoherence (in seconde)
	
	"search_desc" : {
		request : {
			type : "custom", // type of search
			param : {
				"custom_function" : search
			},
			idField : "ip_with_mask",  // field to use like an id
			labelField : "description",  // field to use like a label
		}
	},
	
	
	responses: {
		responseIsUnique : true, // If resposne is unique add response in blacklist after resolve
		request : {
			type : "query", // type of search
			param : {
				index : "source", // index for search,
				type : "glpi_host",
				body : { // body for research
					query: {
						term: { "haveMapping" : false}
					}
				}
			},
			idField : "id",  // field to use like an id
			labelField : "hostname",  // field to use like a label
		}
	},
	
	propositions: [
	    {
	    	request : {
	    		type : "search",
		    	param : {
		    		index : "source",
		    		type : "glpi_host",
		    		body : {
						query: {
							term: { "haveMapping" : false}
						}
					}
		    	},
		    	idField : null,  // field to use like an id
    			labelField : "hostname",  // field to use like a label
	    	}
	    }
    ]
}


var search=function(){
	// recuperation de toutes les ip dans ipplan
	var searchIPPlan=searchUtility.searchElasticSearch({
		"index":"source",
		"type":"ipplan_ip",
		"body":{
			query : {
				"match_all" : {}
			},
			fields : ["ip_with_mask"]
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	})
	.then(function(body){
		// Transformation en une liste d'ip
		return ElasticSearchParser.getListOfOneField(body,"ip_with_mask");
	})
	.then(function(ipplan_result){
		// Recuperationdes toutes les IP SNPM qui ne sont aps dans IPPlan
		return searchSNMPIP=searchUtility.searchElasticSearch({
			"index":"source",
			"type":"snmp_ip",
			"body":{
				query : {
					"match_all" : {}
				},
				"filter" : {
					"not" : {
		            	"terms" : { "ip.ip_with_mask" : ipplan_result}
					}
				},
				fields : ["sysName"]
			},
			"from":0,
			"size":999999999,
			"scroll" : "1m"
		});
	})
	.then(function(body){
		// Récuparation de la recherche en liste
		return ElasticSearchParser.loadFromBodyFields(body);
	});	
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