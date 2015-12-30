/**
 * Middleware permettant de gérer le rechargement des coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var http = require("http");
var elasticsearch = require('elasticsearch');

var clientElasticsearch = new elasticsearch.Client({
  host: 'localhost:9200'
});

/**
 * Update and delete data of coherence in elasticsearch
 * @param coherenceName
 * @param dataCoherence
 */
function updateDataCoherenceToES(coherenceName,dataCoherence,callback){
	var body=[];
	var allIds=[];
	// on ajoute les update dans le body
	dataCoherence.forEach(function(coherence){
		var id=coherence.id;
		// on suavegarde toutes les id pour supprimer les id qui n'existe plus
		allIds.push(id);
		body.push({ index: { _index: 'coherence_'+coherenceName, _type: 'data', _id: id } });
		body.push(coherence);
	});
	
	// on recherche les elements qui ne doivent plus etre présent
	clientElasticsearch.search({
		index: 'coherence_'+coherenceName,
		type: 'data',
		body: {
			"fields" : ["_id"],
			"filter" : {
				"not" : {
	            	"terms" : { "_id" : allIds}
				}
	        }
		}
	}, function (error, response) {
		if("hits" in response && "hits" in response['hits']){
			var hits=response['hits']['hits'];

			// on ajoute les delete au body
			hits.forEach(function(hit){
				if("_index" in hit && "_type" in hit && "_id" in hit){
					body.push({ "delete": { _index: hit._index, _type: hit._type, _id: hit._id } });
				}
			});
		}
		
		// On lance le groupement d'action (update+delete)
		clientElasticsearch.bulk({
			body: body
		}, function (error, response) {
			var nbUpdate=0;
			var nbDelete=0;
			if("items" in response){
				response['items'].forEach(function(item){
					if("index" in item) nbUpdate++;
					if("delete" in item) nbDelete++;
				});
			}
			console.log("Les données de la coherence '"+coherenceName+"' ont été mis à jour. (Update : "+nbUpdate+", Delete : "+nbDelete+")");
			callback();
		});
	});
}

function getDataCoherence(coherenceName,repeatTime){
	var callback=function(){};
	if(repeatTime!=null && repeatTime!="" && repeatTime>0){
		callback=function(){
			setTimeout(function(){
				getDataCoherence(coherenceName,repeatTime);
			},repeatTime);
		};
	}
	
	var options = {
		host: 'localhost',
		path: '/workspace/Geko-remoteControle/get.php',
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		if(res.statusCode==200){
			res.setEncoding('utf8');
			res.on('data', function (dataCoherence) {
				updateDataCoherenceToES(coherenceName, JSON.parse(dataCoherence),callback);
			});
		}
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

var timer=9000;
setTimeout(function(){
	getDataCoherence("test",timer);
},timer);
