/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */

var Q = require('q');
var ElasticsearchClient = require('../../Elasticsearch/ElasticsearchClient');
var ElasticsearchParser = require('../../Elasticsearch/ElasticsearchParser');
var targetDataset = require("./targetDataset");
var redisUtility = require("../../Redis/redisUtility");

/**
 * Constructeur
 */
function ConsistencyGetter() {}

var methodStatic = ConsistencyGetter;


/**
 * Search incoherence
 * @param coherence
 * @param blacklist
 * @param justOne
 * @returns
 */
methodStatic.getIncoherences=function(name,blacklist,justOne){
	var size=config.maxIncoherences;
	if(justOne) size=1;
	
	return redisUtility.getDataException(redisUtility.getKeyCoherenceException(name,"validate","*")).then(function(exceptions){
		blacklist=blacklist.concat(exceptions);
		
		return ElasticsearchClient.search({
			"index" : "consistency_"+name,
			"type" : "consistency",
			"body" : {
				"query" : {
					"term" : { "incoherence" : true }
				},
				"filter" : {
					"not" : {
						"terms" : { "id" : blacklist }
					}
				},
				"sort" : [
					{ "label" : "asc" }       
	            ],
				"fields" : ["id","label"]
			},
			"size" : size
		});
	}).then(function(body){
		return ElasticsearchParser.loadFromBodyFields(body);
	});
}

/**
 * Search all responses classified by elem (all, id or label)
 */
methodStatic.getResponsesByElem=function(name,ids,labels){
	var filterOr=[
	    {"term" : { "target.all" : true }}
	];
	
	if(ids!=null && Array.isArray(ids) && ids.length > 0) filterOr.push({"terms" : { "target.id" : ids }});
	if(labels!=null && Array.isArray(labels) && labels.length > 0) filterOr.push({"terms" : { "target.label" : labels }});
	
	return ElasticsearchClient.search({
		"index" : "consistency_"+name,
		"type" : "consistency_responses",
		"body" : {
			"query" : {
				"or" : filterOr
			},
			"fields" :  ["target.label","target.id","target.all","response_id","response_label"]
		}
	}).then(function(body){
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(targetDataset.sortDataByTarget);
}

/**
 * Search suggestion by elem
 */
methodStatic.getSuggestionsByElem=function(name,ids,labels){
	var filterOr=[
  	    {"term" : { "target.all" : true }}
  	];
  	
  	if(ids!=null && Array.isArray(ids) && ids.length > 0) filterOr.push({"terms" : { "target.id" : ids }});
  	if(labels!=null && Array.isArray(labels) && labels.length > 0) filterOr.push({"terms" : { "target.label" : labels }});
	
	return ElasticsearchClient.search({
		"index" : "consistency_"+name,
		"type" : "consistency_suggestions",
		"body" : {
			"query" : {
				"or" : filterOr
			},
			"sort" : [
				{ "label" : "asc" }    
	        ],
			"fields" : ["target.label","target.id","target.all","response_id","response_label"]
		},
		"size" : 9999
	}).then(function(body){
		return ElasticsearchParser.loadFromBodyFields(body);
	}).then(targetDataset.sortDataByTarget);
}


/**
 * Search all responses of one elem
 */
methodStatic.getResponsesOfElem=function(name,id,label){
	var ids=[];
	var labels=[];
	
	if(id!=null && id!="") ids.push(id);
	if(label!=null && label!="") labels.push(label);
	
	return ConsistencyGetter.getResponsesByElem(name,ids,labels).then(function(responsesByElem){
		var td=new targetDataset(responsesByElem);
		return td.getDataOfElem(id,label);
	});
}

/**
 * Search responses of multi-elem
 */
methodStatic.getResponsesOfMultiElems=function(name,ids,labels){
	return ConsistencyGetter.getResponsesByElem(name,ids,labels).then(function(responsesByElem){
		var td=new targetDataset(responsesByElem);
		return td.getDataOfAll();
	});
}


/**
 * Search all suggestions of one elem
 */
methodStatic.getSuggestionsOfElem=function(name,id,label){
	var ids=[];
	var labels=[];
	
	if(id!=null && id!="") ids.push(id);
	if(label!=null && label!="") labels.push(label);
	
	return ConsistencyGetter.getSuggestionsByElem(name,ids,labels).then(function(suggestionsByElem){
		var td=new targetDataset(suggestionsByElem);
		return td.getDataOfElem(id,label);
	});
}


/**
 * Search suggestions of multi-elem
 */
methodStatic.getSuggestionsOfMultiElems=function(name,elems){
	var ids=[];
	var labels=[];
	
	elems.forEach(function(elem){
		if("id" in elem)
			ids.push(elem.id);
		if("label" in elem)
			labels.push(elem.label);
	});
	
	return ConsistencyGetter.getSuggestionsByElem(name,ids,labels).then(function(suggestionsByElem){
		var td=new targetDataset(suggestionsByElem);
		return td.getDataOfElems(elems);
	});
}


methodStatic.validateMultipleIncoherence=function(coherence,responses){
	var promises=[];
	
	responses.forEach(function(oneResponse){
		promises.push(methodStatic.validateIncoherence(coherence,oneResponse.id,oneResponse.responses));
	});
	
	return Q.all(promises);
}

methodStatic.validateIncoherence=function(coherence,id,responses){
	var params=require("../../ConsistenciesLauncher/consistency/"+coherence+"/params");
	
	if("timerBlacklist" in params){
		// Add data excpetion for exclude this to the incoherence return
		redisUtility.addDataException(redisUtility.getKeyCoherenceException(coherence,"validate",id),id,params.timerBlacklist);
		
		if("responseUnique" in params && params.responseUnique){
			responses.forEach(function(response){
				// Add data excpetion for exclude this to the response return
				redisUtility.addDataException(redisUtility.getKeyCoherenceException(coherence,"responses",response),response,params.timerBlacklist);
			});
		}
	}
	
	var resolve=require("../../ConsistenciesLauncher/consistency/"+coherence+"/resolve");
	
	return resolve();
}

module.exports = methodStatic;