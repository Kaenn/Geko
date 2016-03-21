var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");
var Q = require('q');

var getSuggestions=function(){
	var promises=[]
	
	// Recherche de tous les host avec un hostgroup Zabbix
	promises.push(
		clientElasticsearch.search({
			"index":"source",
			"type":"claratact_host",
			"body":{
				"query" : {
					"term": { "mappings.glpi.type" : "H"}
				},
				"fields" : ["id"]
			},
			"from":0,
			"size":999999999,
			"scroll" : "1m"
		})
		.then(function(body){
			// Récuparation de la recherche en liste
			return ElasticsearchParser.loadFromBodyFields(body);
		})
	);
	
	// Recherche de tous les projets lié à un hostgroup zabbix
	promises.push(
		clientElasticsearch.search({
			"index":"source",
			"type":"claratact_host",
			"body":{
				"query" : {
					"term": { "mappings.glpi.type" : "N"}
				},
				"fields" : ["id"]
			},
			"from":0,
			"size":999999999,
			"scroll" : "1m"
		})
		.then(function(body){
			// Récuparation de la recherche en liste
			return ElasticsearchParser.loadFromBodyFields(body);
		})
	);
	
	return Q.all(promises).then(function(results){
		var retour=[];
		
		var allServeur=results.shift();
		var allNetwork=results.shift();

		allServeur.forEach(function(host){
			if("id" in host){
				retour.push({
					"response_id" : "serveur",
			    	"response_label" : "Serveur",
			    	"target": [
			    	    {
			    	    	"id" : host['id']
			    	    }  
		            ]
				});
			}
		});
		
		allNetwork.forEach(function(host){
			if("id" in host){
				retour.push({
					"response_id" : "network",
			    	"response_label" : "Equipement réseau",
			    	"target": [
			    	    {
			    	    	"id" : host['id']
			    	    }  
		            ]
				});
			}
		});
		
		return retour;
	});
}

module.exports = getSuggestions;