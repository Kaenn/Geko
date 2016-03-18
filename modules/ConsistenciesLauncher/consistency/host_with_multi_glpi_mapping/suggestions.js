var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");
var Q = require('q');

var getSuggestions=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"zabbix_host",
		"body":{
			"query" : {
				"term": { "haveMapping" : false}
			},
			"fields" : ["id","hostname"]
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	}).then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(function(results){
		var retour=[];
		
		results.forEach(function(host){
			retour.push({
				"response_id" : host.id,
		    	"response_label" : host.hostname,
		    	"target": [
		    	    {
		    	    	"label" : host.hostname
		    	    }  
	            ]
			});
		});
		
		return retour;
	});
}

module.exports = getSuggestions;