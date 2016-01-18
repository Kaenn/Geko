/**
 * Middleware permettant de centraliser toutes les actions sur les sources.
 * 
 * @author : Kaenn
 */
var Q = require('q');
var elasticsearch = require('./elasticsearchClient');
var clientElasticsearch=elasticsearch.client;

// Enregistrement de toutes les sources
var allSources=[];
//var sourcesName=['source1','sourceResponses1','sourceIP1','sourceIP2','sourceIP3'];
var sourcesName=['claratact_host','claratact_project','zabbix_host'];

function launchSourcesScheduler(){
	console.log("Launch all sources Scheduler :");
	sourcesName.forEach(function(name){
		// get source class
		var sourcesClass=require("../../sources/"+name);
		allSources[name]=sourcesClass;
		
		// Add getDataFromSource to scheduler
		addSchedulerData("source",name,sourcesClass.getParams("refreshTimer"),sourcesClass.getDataFromSource);
		console.log(" * Source '"+name+"' is launch.");
	});
	console.log("All sources launch.");
}



function addSchedulerData(index,type,timer,update_function){
	setInterval(function(){
		update_function().then(function(data){
			updateDataToES(index,type,data);
		});
	},timer);
}


/**
 * Update and delete unused data of index elasticsearch
 */
function updateDataToES(index,type,data){
	var bodyBulk=[];

	var allIds=[];
	// on ajoute les update dans le bodyBulk
	data.forEach(function(d){
		var id=d.id;
		
		// on sauvegarde toutes les id pour supprimer les id qui n'existe plus
		allIds.push(id);
		bodyBulk.push({ index: { _index: index, _type: type, _id: id } });
		bodyBulk.push(d);
	});

	// on recherche les elements qui ne doivent plus etre présent
	clientElasticsearch.search({
		index: index,
		type: type,
		body: {
			"fields" : ["_id"],
			"filter" : {
				"not" : {
	            	"terms" : { "_id" : allIds}
				}
	        }
		}
	}).then(function (body) {
		if("hits" in body && "hits" in body['hits']){
			var hits=body['hits']['hits'];

			// on ajoute les delete au bodyBulk
			hits.forEach(function(hit){
				if("_index" in hit && "_type" in hit && "_id" in hit){
					bodyBulk.push({ "delete": { _index: hit._index, _type: hit._type, _id: hit._id } });
				}
			});
		}
	},function(){/* Empty function in case of new index Exception*/}).then(function(){
		// On lance le groupement d'action (update+delete)
		return clientElasticsearch.bulk({
			body: bodyBulk
		})
	}).then(function (body) {
		var nbUpdate=0;
		var nbDelete=0;
		if("items" in body){
			body['items'].forEach(function(item){
				if("index" in item) nbUpdate++;
				if("delete" in item) nbDelete++;
			});
		}
		console.log("L'index "+index+" / "+type+" a été mis à jour. (Update : "+nbUpdate+", Delete : "+nbDelete+")");
	})
	.catch(console.log);
}


exports.launchSourcesScheduler = launchSourcesScheduler;