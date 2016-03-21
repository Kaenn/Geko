var ElasticsearchParser = require("../../../Elasticsearch/ElasticsearchParser");
var clientElasticsearch = require("../../../Elasticsearch/ElasticsearchClient");
var utility = require("../../../utility");
var consistency_utility = require("./consistency_utility");

var getConsistencies=function(){
	// recuperation de toutes les ip dans ipplan
	return consistency_utility.getIPManquante(['sysName'])
	.then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	})
	.then(function(result){
		return utility.addAutoIncrement(result);
	})
	.then(function(result){
		// Suppression des doublons sur le sysName et formattage du retour
		var sysNameListe=[];
		
		var retour=[];
		result.forEach(function(row){
			if(sysNameListe.indexOf(row['sysName']) == -1){
				sysNameListe.push(row['sysName']);
				
				retour.push({"id":row['sysName'],"label":row['sysName']});
			}
		});
		return retour;
	})
	.catch(console.log);
}


var getAll=function(){
	// recuperation de toutes les ip dans ipplan
	return clientElasticsearch.search({
		"index":"source",
		"type":"snmp_ip",
		"body":{
			"query" : {
				"match_all" : {}
			},
			"fields" : ['sysName']
		},
		"from":0,
		"size":999999999,
		"scroll" : "1m"
	}).then(function(body){
		// Récuparation de la recherche en liste
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(function(result){
		return utility.addAutoIncrement(result);
	}).then(function(result){
		// Suppression des doublons sur le sysName et formattage du retour
		var sysNameListe=[];
		
		var retour=[];
		result.forEach(function(row){
			if(sysNameListe.indexOf(row['sysName']) == -1){
				sysNameListe.push(row['sysName']);
				
				retour.push({"id":row['sysName'],"label":row['sysName']});
			}
		});
		return retour;
	}).catch(console.log);
}


exports.getConsistencies = getConsistencies;
exports.getAll = getAll;