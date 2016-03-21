var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");

var getResponses=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"glpi_host",
		"body":{
			"query" : {
				"term": { "haveMapping" : false}
			},
			"fields" : ["id","hostname"]
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	})
	.then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	})
	.then(function(res){
		var retour=[];
		res.forEach(function(row){
			retour.push({
				"response_id" : row['id'],
		    	"response_label" : row['hostname'],
		    	"target": [
		    	    {
		    	    	"all" : true
		    	    }  
	            ]
			});
		});
		
		return retour;
	});
}


module.exports = getResponses;