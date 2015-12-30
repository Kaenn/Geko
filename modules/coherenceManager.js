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
});


// Enregistrement de toutes les coherences
var allCoherences=[];
var coherencesName=['test'];
coherencesName.forEach(function(name){
	allCoherences[name]=require("../coherences/"+name);
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
	return clientRedisKeys(redisKey_regexp)
	.then(getRedisKeys)
	.then(function(validateInProgress){
		// Add validate in progress to blacklist
		blacklist=blacklist.concat(validateInProgress);
		
		var body={
			"fields": fields,
			"query": query,
			"filter" : {
				"not" : {
	            	"terms" : { "id" : blacklist}
				}
	        }
		}
		
		if(justeOne!=null && justeOne)
			body['size']=1;
		
		// Search all incoherence not in blacklist
		return clientElasticsearch.search({
			index: index,
			type: type,
			body: body
		});
	});
}


function refreshNbCoherence(clients,coherence,outil,target){
	searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',['id'],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["id", "label"],allCoherences[coherence].getQueryElasticSearch(),blacklist,true).then(function(body){
		var id=null;
		var label=null;
		var input=allCoherences[coherence].getInput();
		var proposition=allCoherences[coherence].getProposition();
		
		if(body.hits.hits.length > 0){
			var incoherence=body.hits.hits.shift().fields;
			if("id" in incoherence)
				id=incoherence.id.shift();
			if("label" in incoherence)
				label=incoherence.label.shift();
		}
		
		client.emit("get-next-incoherence",coherence,id,label,input,proposition);
	});
}


function getAllIncoherence(client,coherence,outil,target){
	searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["id", "label"],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		client.emit("get-all-incoherence",coherence,outil,target,body.hits.hits.map(function(hit) {
			  return { "id" : hit.fields.id.shift(), "label" : hit.fields.label.shift() };
		}));
	});
}



function validateIncoherence(client,coherence,outil,target,id,response){
	allCoherences[coherence].resolve(id,response);
	
	var key="coherence:"+coherence+":validate:"+id;
	
	clientRedisSet(key,id)
	.then(clientRedisExpire(key,30))
	.then(function(){
		client.emit("validate-incoherence",coherence,outil,target);
	});
}


/**
 * Initialize client page and their events
 */
var initialize=function(client,clients){
	client.on('refresh-nb-incoherence', function(coherence,outil,target) {
		// Refresh coherence number
		refreshNbCoherence(clients,coherence,outil,target);
	});
	
	client.on('get-all-incoherence', function(coherence,outil,target) {
		// Return all coherence to client
		getAllIncoherence(client,coherence,outil,target);
	});
	
	client.on('get-next-incoherence', function(coherence,outil,target,blacklist) {
		// Return next incoherence to client
		getNextCoherence(client,coherence,outil,target,blacklist);
	});
	
	client.on('validate-incoherence', function(coherence,outil,target,id,response) {
		// Validate incoherence
		validateIncoherence(client,coherence,outil,target,id,response);
	});
}

exports.initialize = initialize;