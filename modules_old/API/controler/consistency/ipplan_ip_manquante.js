var http = require("http");
var Q = require('q');
var searchUtility = require('../../modele/searchUtility');
var ElasticSearchParser = require('../ElasticSearchParser');
var ResultParser = require("../ResultParser");


var getAllIpIPPlan=function(){
	// recuperation de toutes les ip dans ipplan
	return searchUtility.searchElasticSearch({
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
	}).then(function(body){
		// Transformation en une liste d'ip
		return ElasticSearchParser.getListOfOneField(body,"ip_with_mask");
	});
}

var search=function(){
	// recuperation de toutes les ip dans ipplan
	return getAllIpIPPlan()
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
		            	"terms" : { "ip.ip_with_mask" : ipplan_result},
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

var searchResponse=function(elem_ids){
	var promises=[
	    getAllIpIPPlan(),
	    searchSNMPIP=searchUtility.searchElasticSearch({
			"index":"source",
			"type":"snmp_ip",
			"body":{
				query : {
		            "terms" : { "sysName" : elem_ids}
				},
				fields : ["sysName","ip.ip_with_mask"]
			},
			"from":0,
			"size":999999999,
			"scroll" : "1m"
		}).then(function(body){
			// Transformation en une liste d'ip
			return ElasticSearchParser.getListOfOneField(body,"ip.ip_with_mask");
		})
    ];
	
	return Q.all(promises,function(promisesResults){
		var allIpIpplan=promisesResults[0];
		var responses=promisesResults[1];
		
		// Parse the result
	    var parser=new ResultParser(responses);
	    
	    parser.addBlacklistField("ip.ip_with_mask",allIpIpplan);

	    return parser.getFormattedResult();
	});
}


var params={
	timerBlacklist : 90, // Time in blacklist after resolve an incoherence (in seconde)
	
	"search_desc" : {
		request : {
			type : "custom", // type of search
			params : {
				"custom_function" : search
			},
			idField : "sysName",  // field to use like an id
			labelField : "sysName",  // field to use like a label
		}
	},
	
	
	responses: {
		responseIsUnique : true, // If resposne is unique add response in blacklist after resolve,
		request : {
			type : "custom", // type of search
			params : {
				"custom_function" : searchResponse
			},
			idField : "ip.ip_with_mask",  // field to use like an id
			labelField : "ip.ip_with_mask",  // field to use like a label
    	},
    	mode : "proposition"
	},
	
	propositions: []
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
exports.params = params;


// Fonctions
exports.resolve = resolve;