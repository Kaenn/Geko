var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");
var consistency_utility = require("./consistency_utility");

var getResponses=function(){
	return consistency_utility.getIPManquante(['sysName','ip_with_mask'])
	.then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	})
	.then(function(res){
		var retour=[];
		res.forEach(function(row){
			retour.push({
				"response_id" : row['ip_with_mask'],
		    	"response_label" : row['ip_with_mask'],
		    	"target": [
		    	    {
		    	    	"label" : row['sysName']
		    	    }  
	            ]
			});
		});
		
		return retour;
	});
}


module.exports = getResponses;