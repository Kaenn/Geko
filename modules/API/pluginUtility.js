var elasticsearch = require('./elasticsearchClient');
var redis = require('./redisClient');
var clientElasticsearch=elasticsearch.client;
var extend = require('util')._extend;

/**
 * Search in Elastisearch with extend blacklist in redis
 * @returns
 */
function searchInInventaire(redisKey_regexp,index,type,search_body,blacklist,justeOne){
	// Get all validate in progress
	return getDataException(redisKey_regexp)
	.then(function(dataException){
		// Add validate in progress to blacklist
		blacklist=blacklist.concat(dataException);
		
		var body=extend({}, search_body);
		body["filter"]= {
			"not" : {
            	"terms" : { "_id" : blacklist}
			}
        };
		
		if(justeOne!=null && justeOne)
			body['size']=1;

		// Search all incoherence not in blacklist
		return clientElasticsearch.search({
			index: index,
			type: type,
			body: body
		})
		.catch(console.log);
	});
}


function queryInInventaire(index,type,filter,search_body,field){
	var body=extend({}, search_body);
	
	if(filter!=null){
		body["filter"]= filter;
	}

	body['fields']=field;

	return clientElasticsearch.search({
		index: index,
		type: type,
		body: body
	});
}


function addDataException(key,id,expiration){
	return redis.set(key,id)
	.then(redis.expire(key,expiration))
	.catch(console.log);
}

function getDataException(key){
	return redis.keys(key)
			.then(redis.getMultiKey);
}


exports.searchInInventaire=searchInInventaire;
exports.queryInInventaire = queryInInventaire;
exports.addDataException = addDataException;
exports.getDataException = getDataException;