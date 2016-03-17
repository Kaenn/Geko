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
					"exists": {"field": "zabbix.hostgroup_id"}
				},
				"fields" : ["id","zabbix.hostgroup_id"]
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
			"type":"claratact_project",
			"body":{
				"query" : {
					"exists": {"field": "zabbix.hostgroup_id"}
				},
				"fields" : ["id","project_name","zabbix.hostgroup_id"]
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
		
		var allHosts=results.shift();
		var allProjects=results.shift();

		// classement par hostgroup id des projets
		var allProjectByHostgroupId={};
		allProjects.forEach(function(project){
			if("zabbix.hostgroup_id" in project){
				allProjectByHostgroupId[project["zabbix.hostgroup_id"]]=project;
			}
		});
		
		// On cherche si le hostgroup du host est lié à un projet
		allHosts.forEach(function(host){
			if("zabbix.hostgroup_id" in host && host["zabbix.hostgroup_id"] in allProjectByHostgroupId){
				retour.push({
					"response_id" : allProjectByHostgroupId[host["zabbix.hostgroup_id"]]['id'],
			    	"response_label" : allProjectByHostgroupId[host["zabbix.hostgroup_id"]]['project_name'],
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