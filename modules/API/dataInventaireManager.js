/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var elasticsearch = require('elasticsearch');
var redis = require('redis');
var Q = require('q');
var extend = require('util')._extend;

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
function test2(body,mapping_fields){
	var returnFields=[];
	
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				var fields=hit['fields'];
				
				var row={};
				
				mapping_fields.forEach(function(mapping){
					var field_name=mapping.name;
					var label=mapping.label;
					var isArray=false;
					if("isArray" in mapping)
						isArray=mapping.isArray;
					
					if(field_name in fields){
						var field_val=fields[field_name];
						if(Array.isArray(field_val) && !isArray)		
							row[label]=field_val[0];
						else
							row[label]=field_val;
					}
				});
				
				if(Object.keys(row).length > 0)
					returnFields.push(row);
			}
		});
	}
	
	return returnFields;
}

var test3=function(label_identifier,list){
	var listByIdentifier={};
	
	list.forEach(function(row){
		if(typeof row !== "undefined" && label_identifier in row){
			if(!(row[label_identifier] in listByIdentifier)){
				listByIdentifier[row[label_identifier]]=[];
			}
			
			listByIdentifier[row[label_identifier]]=row;
		}
	});
	
	return listByIdentifier;
}

var test=function(){
	var promises=[];
	
	promises.push(
		clientElasticsearch.search({
			index: "source",
			type: "sourceIP1",
			body: {
				query : {
					"match_all" :{}
				},
				fields: ["hostname","ips.ip"]
			}
		}).then(function(body){
			return test3("id",test2(body,[{name:"hostname",label:"id"},{name:"ips.ip",label:"toCompare",isArray:true}]))
		}).catch(console.log)
	);

	promises.push(
		clientElasticsearch.search({
			index: "source",
			type: "sourceIP2",
			body: {
				query : {
					"match_all" :{}
				},
				fields: ["hostname","ips.ip"]
			}
		}).then(function(body){
			return test3("id",test2(body,[{name:"hostname",label:"id"},{name:"hostname",label:"label"},{name:"ips.ip",label:"toCompare",isArray:true}]))
		})
	);
	
	Q.all(promises).then(function(searchs){
		var compareElem={};
		
		// Check if isIn is in base
		var arrayBase=searchs[0];
		var arrayIsIn=searchs[1];
		
		for(id in arrayIsIn){
			var elemIsIn=arrayIsIn[id].toCompare;
			if(id in arrayBase){
				var elemBase=arrayBase[id].toCompare;
				var responses=[];
				
				elemIsIn.forEach(function(elemI){
					var isIn=false;
					elemBase.forEach(function(elemB){
						if(elemI==elemB) isIn=true;
					});
					
					if(!isIn) responses.push(elemI);
				});
				
				if(responses.length > 0){
					compareElem[id]={
						"id": id,
						"label": arrayIsIn[id].label,
						"responses": responses
					};
				}
			}else{
				compareElem[id]={
					"id": id,
					"label": arrayIsIn[id].label,
					"responses": elemIsIn
				};
			}
		}
		
		console.log("tt",compareElem);
	});
}

/**
 * Search in Elastisearch with extend blacklist in redis
 * @returns
 */
function searchInInventaire(redisKey_regexp,index,type,search_body,blacklist,justeOne){
	test();
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
	return clientRedisSet(key,id)
	.then(clientRedisExpire(key,expiration))
	.catch(console.log);
}

function getDataException(key){
	return clientRedisKeys(key)
			.then(getRedisKeys);
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

exports.searchInInventaire = searchInInventaire;
exports.queryInInventaire = queryInInventaire;
exports.addDataException = addDataException;
exports.getDataException = getDataException;
exports.addSchedulerData = addSchedulerData;