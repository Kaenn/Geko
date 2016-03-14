var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");

var getIPManquante=function(fields){
	// recuperation de toutes les ip dans ipplan
	return clientElasticsearch.search({
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
		return ElasticsearchParser.getListOfOneField(body,"ip_with_mask");
	})
	.then(function(ipplan_result){
		// Recuperation des toutes les IP SNPM qui ne sont aps dans IPPlan
		return searchSNMPIP=clientElasticsearch.search({
			"index":"source",
			"type":"snmp_ip",
			"body":{
				query : {
					"match_all" : {}
				},
				"filter" : {
					"not" : {
		            	"terms" : { "ip_with_mask" : ipplan_result}
					}
				},
				fields : fields
			},
			"from":0,
			"size":999999999,
			"scroll" : "1m"
		});
	});
}

exports.getIPManquante = getIPManquante;