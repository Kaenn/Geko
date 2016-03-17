var redis = require('./redisClient');


function addDataException(key,id,expiration){
	return redis.set(key,id)
	.then(redis.expire(key,expiration))
	.catch(console.log);
}

function getDataException(key){
	return redis.keys(key)
			.then(redis.getMultiKey);
}

function getKeyCoherenceException(coherence,type,id){
	return "coherence:exception:"+coherence+":"+type+":"+id;
}


exports.addDataException=addDataException;
exports.getDataException=getDataException;
exports.getKeyCoherenceException=getKeyCoherenceException;