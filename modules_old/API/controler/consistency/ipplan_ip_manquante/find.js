var searchUtility = require('../../modele/searchUtility');
var ElasticSearchParser = require('../ElasticSearchParser');


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

var find=function(){
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

// Fonctions
exports.find = find;