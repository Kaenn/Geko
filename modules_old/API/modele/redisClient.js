/**
 * @author : Kaenn
 */
var redis = require('redis');
var Q = require('q');

//-- Redis -- //
var client = redis.createClient(6379, 'localhost').on("connect", function () {
	console.log("Redis : OK");
});

//Denodify redis fonction
var clientRedisKeys = Q.nbind(client.keys, client);
var clientRedisGet = Q.nbind(client.get, client);
var clientRedisSet = Q.nbind(client.set, client);
var clientRedisExpire = Q.nbind(client.expire, client);

/**
 * Get multi keys
 */
var getMultiKey=function(keys){
	var promises = [];
	
	keys.forEach(function(key){
        promises.push(clientRedisGet(key));
    });
	 
    return Q.all(promises);
}

exports.client = client;
exports.keys=clientRedisKeys;
exports.get=clientRedisGet;
exports.set=clientRedisSet;
exports.expire=clientRedisExpire;
exports.getMultiKey=getMultiKey;