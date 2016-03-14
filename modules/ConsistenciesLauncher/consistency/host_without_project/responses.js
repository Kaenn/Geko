var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");

var getResponses=function(){
	return clientElasticsearch.search({
		"index":"source",
		"type":"claratact_project",
		"body":{
			"query" : {
				"match_all": {}
			},
			"fields" : ["id","project_name"]
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
		    	"response_label" : row['project_name'],
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