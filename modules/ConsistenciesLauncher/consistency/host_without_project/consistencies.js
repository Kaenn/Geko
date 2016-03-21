var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");
var utility = require("../../../utility");

var getConsistencies=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"claratact_host",
		"body":{
			"query" : {
				"or": [
				    {
				    	"missing" : { "field": "project_id"}
				    },
				    {
				    	"term": { "project_id" : 0}
				    }
				]
			},
			"fields" : ["id","hostname"]
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	}).then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(function(result){
		var retour=[];
		result.forEach(function(row){
			retour.push({"id":row['id'],"label":row['hostname']});
		});
		return retour;
	});
}


var getAll=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"claratact_host",
		"body":{
			"query" : {
				"match_all" : {}
			},
			"fields" : ["id","hostname"]
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	}).then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(function(result){
		var retour=[];
		result.forEach(function(row){
			retour.push({"id":row['id'],"label":row['hostname']});
		});
		return retour;
	});
}

exports.getConsistencies = getConsistencies;
exports.getAll = getAll;