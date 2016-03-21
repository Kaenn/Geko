var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");

var getResponses=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"claratact_host_type",
		"body":{
			"query" : {
				"match_all": {}
			},
			"fields" : ["type","label"]
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
				"response_id" : row['type'],
		    	"response_label" : row['label'],
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