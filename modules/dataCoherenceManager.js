/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var elasticsearch = require('elasticsearch');
var redis = require('redis');
var Q = require('q');

var clientElasticsearch = new elasticsearch.Client({
  host: 'localhost:9200'
});
console.log("ElasticSearch : OK");

//-- Redis -- //
var clientRedis = redis.createClient(6379, 'localhost').on("connect", function () {
	console.log("Redis : OK");
	
	clientRedisKeys('*').then(function(r){
		console.log(r);
	});
	
});


// Denodify redis fonction
var clientRedisKeys = Q.nbind(clientRedis.keys, clientRedis);
var clientRedisGet = Q.nbind(clientRedis.get, clientRedis);
var clientRedisSet = Q.nbind(clientRedis.set, clientRedis);
var clientRedisExpire = Q.nbind(clientRedis.expire, clientRedis);

function getRedisKeys(keys){
	var promises = [];
	
	keys.forEach(function(key){
        promises.push(clientRedisGet(key));
    });
	 
    return Q.all(promises);
}


/**
 * Search in Elastisearch with extend blacklist in redis
 * @param redisKey_regexp Regexp redis for extend blacklist
 * @param index Index ElasticSearch
 * @param type Type ElasticSearch
 * @param fields Fields ElasticSearch
 * @param query Query ElasticSearch
 * @param blacklist Default blacklist
 * @param justeOne Boolean for juste have one result or more
 * @returns
 */
function searchCoherence(redisKey_regexp,index,type,fields,query,blacklist,justeOne){
	// Get all validate in progress
	return getDataException(index,type)
	.then(function(dataException){
		// Add validate in progress to blacklist
		blacklist=blacklist.concat(dataException);
		
		var body={
			"fields": fields,
			"filter" : {
				"not" : {
	            	"terms" : { "_id" : blacklist}
				}
	        }
		}
		
		console.log(index,type,blacklist);
		
		if(query!=null)
			body['query']=query;
		
		if(justeOne!=null && justeOne)
			body['size']=1;
		
		console.log(body);
		
		// Search all incoherence not in blacklist
		return clientElasticsearch.search({
			index: index,
			type: type,
			body: body
		});
	});
}


function addDataException(index,type,id,expiration){
	var key=getKeyDataException(index,type,id);
	return clientRedisSet(key,id)
	.then(clientRedisExpire(key,expiration))
	.catch(console.log);
}

function getDataException(index,type){
	return clientRedisKeys(getKeyDataException(index,type,"*"))
			.then(getRedisKeys);
}


function getKeyDataException(index,type,id){
	return "coherence:exception:"+index+":"+type+":"+id;
}


function addSchedulerDataCoherence(index,type,timer,update_function){
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
		delete d['id']; // Delete the id of the body because is the _id of elasticsearch
		
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

exports.searchCoherence = searchCoherence;
exports.addDataException = addDataException;
exports.getDataException = getDataException;
exports.addSchedulerDataCoherence = addSchedulerDataCoherence;