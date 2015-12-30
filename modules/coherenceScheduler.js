/**
 * Middleware permettant de gérer le rechargement des coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var http = require("http");
var elasticsearch = require('elasticsearch');
var Q = require('q');

var clientElasticsearch = new elasticsearch.Client({
  host: 'localhost:9200'
});



function addSchedulerCoherence(index,type,timer,update_function){
	setTimeout(function(){
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
	}).then(function(){
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
	});
}


function getDataCoherence(coherenceName){
	var deferred = Q.defer();
    
	var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/get.php',
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		if(res.statusCode==200){
			res.setEncoding('utf8');
			res.on('data', function (data) {
				deferred.resolve(JSON.parse(data));
			});
		}
	});

	req.on('error', function(e) {
		deferred.reject(e.message);
	});
	
	req.end();
	
	return deferred.promise;
}

addSchedulerCoherence("coherence_test","data",3000,getDataCoherence);
