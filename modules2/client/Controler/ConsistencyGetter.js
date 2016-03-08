/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */

var Q = require('q');
var ElasticsearchClient = require('../../Elasticsearch/ElasticsearchClient');
var ElasticsearchParser = require('../../Elasticsearch/ElasticsearchParser');

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
	
	return ElasticsearchClient.search({
		"index" : "consistency_"+name,
		"type" : "consistency",
		"body" : {
			"query" : {
				"match_all" : {}
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
	}).then(function(result){
		var retour={
			"all" : [],
			"id" : {},
			"label" : {}
		};
		
		// Rangement des resultats en fonction de leur target
		result.forEach(function(row){
			if("target.all" in row){
				retour['all'].push({
					"id" : row['response_id'],
					"label" : row['response_label']
				});
			}
			
			if("target.id" in row){
				var id=row['target.id'];
				if(! (id in retour['id'])) retour['id'][id]=[];
				
				retour['id'][id].push({
					"id" : row['response_id'],
					"label" : row['response_label']
				});
			}
			
			if("target.label" in row){
				var label=row['target.label'];
				if(! (label in retour['label'])) retour['label'][label]=[];
				
				retour['label'][label].push({
					"id" : row['response_id'],
					"label" : row['response_label']
				});
			}
		});
		
		return retour;
	});
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
		var responsesOfElem=[];
		
		// On recupère les reponses commune a tous les elems
		if("all" in responsesByElem){
			responsesOfElem=responsesOfElem.concat(responsesByElem.all);
		}
		
		// on recupère les reponses lié a cette id
		if("id" in responsesByElem && id in responsesByElem.id){
			responsesOfElem=responsesOfElem.concat(responsesByElem.id[id]);
		}
		
		
		// On recupère les reponses lié a ce label
		if("label" in responsesByElem && label in responsesByElem.label){
			responsesOfElem=responsesOfElem.concat(responsesByElem.label[label]);
		}
		
		return responsesOfElem;
	});
}



/**
 * Search suggestion of one elem
 */
methodStatic.getSuggestions=function(name,id,label){
	return ElasticsearchClient.search({
		"index" : "consistency_"+name,
		"type" : "consistency_suggestions",
		"body" : {
			"query" : {
				"or" : [
					{"term" : { "target.label" : label }},
					{"term" : { "target.id" : id }},
					{"term" : { "target.all" : true }}
				]
			},
			"sort" : [
				{ "label" : "asc" }    
	        ],
			"fields" : ["response_id","response_label"]
		},
		"size" : 9999
	}).then(function(body){
		return ElasticsearchParser.loadFromBodyFields(body);
	})
	.catch(console.log);
}




setTimeout(function(){
	/*ConsistencyGetter.getResponses("ipplan_ip_manquante",[1],["host3"]).then(function(r){
		console.log("END",r);
		
		for(var hostname in r['label']){
			console.log("===>",r['label'][hostname]);
		}
	}).catch(console.log);*/
	
	//getResponses("test1",1,"inco1");
	//getAllResponses("test1");
	//getSuggestions("test1",1,"inco1");
},500);




/*
method.getNbCoherence=function(coherence){
	return getIncoherences(coherence,[],false).then(function(allIncoherence){
		return allIncoherence.length;
	});
}

method.getNextIncoherence=function(coherence,blacklist){
	return getFullIncoherences(coherence,blacklist,true).then(function(fullIncoherences){
		var nextIncoherence=null;
		if("incoherences" in fullIncoherences){
			nextIncoherence=fullIncoherences["incoherences"].shift();
			
			if(nextIncoherence!=null && "responses" in fullIncoherences)
				nextIncoherence["responses"]=fullIncoherences["responses"];
		}
		
		return nextIncoherence;
	});
}

method.getAllIncoherences=function(coherence){
	return getFullIncoherences(coherence,[],false);
}


method.validateMultipleIncoherence=function(coherence,responses){
	var promises=[];
	
	responses.forEach(function(oneResponse){
		promises.push(validateIncoherence(coherence,oneResponse.id,oneResponse.responses));
	});
	
	return Q.all(promises);
}

method.validateIncoherence=function(coherence,id,responses){
	var coherenceClass=allCoherences[coherence];
	// launch resolve action
	coherenceClass.resolve(id,responses);
	
	// Add data excpetion for exclude this to the incoherence return
	return pluginUtility.addDataException(getKeyDataException(coherence,"validate",id),id,coherenceClass.getParams("timerBlacklist"));
	
	if(coherenceClass.getParams("responseIsUnique")){
		responses.forEach(function(response){
			// Add data excpetion for exclude this to the incoherence return
			pluginUtility.addDataException(getKeyDataException(coherence,"responses",response),response,coherenceClass.getParams("timerBlacklist"));
		});
	}
}

/**
 * PRIVATE FUNCTION
 */
/*
function getKeyDataException(coherence,type,id){
	return "coherence:exception:"+coherence+":"+type+":"+id;
}


method.getFullIncoherences=function(coherence,blacklist,justOne){
	var promises = [
	    getIncoherenceAndPropositions(coherence,blacklist,justOne),
	    getAllResponses(coherence)
	];

    return Q.all(promises).then(function(promise_responses){
    	var allIncoherences=promise_responses.shift();
    	var responses=promise_responses.shift();
		
    	var allFullIncoherence=[];
    	
    	allIncoherences.forEach(function(incoherence){
    		var propositions=[];
        	var id=null;
        	var label=null;
        	
    		if(typeof incoherence !== "undefined"){
    	    	if("id" in incoherence)
    	    		id=incoherence.id;
    	    	
    	    	if("label" in incoherence)
    	    		label=incoherence.label;
    	    	
    	    	// Search proposition with a response
    	    	if("propositions" in incoherence){
    	    		incoherence.propositions.forEach(function(oneProposition){
    	    			if(typeof oneProposition !== "undefined"){
    	    				responses.forEach(function(oneInput){
    				    		if(oneProposition.label !=null && oneInput.label==oneProposition.label){
    				    			propositions.push(oneInput);
    				    		}else if(oneProposition.id !=null && oneInput.id==oneProposition.id){
    				    			propositions.push(oneInput);
    				    		}
    				    	});
    	    			}
    	    		});
    	    	}
        	}

    		allFullIncoherence.push({
    			id: id,
    			label: label,
    			propositions: propositions
    		});
    	});

    	return {
    		incoherences: allFullIncoherence,
    		responses: responses
    	}
    	
    })
    .catch(console.log);
}


/** 
 * Search incoherence and get proposition
 * @param coherence
 * @param blacklist
 * @returns
 *//*
var getIncoherenceAndPropositions=function(coherence,blacklist,justOne){
	return getIncoherences(coherence,blacklist,justOne).then(function(allIncoherence){
		return getPropositions(coherence,allIncoherence).then(function(allPropositions){
			// on reclasse les propositions par identifier 
			var propositionsByIdentifier={};
			
			// Parcours tout les propositions
			allPropositions.forEach(function(onePropositionResults){
				// See all resultats for this propositions and classify by identifier 
				onePropositionResults.forEach(function(oneProposition){
					if(typeof oneProposition !== "undefined" && "_id" in oneProposition){
						if(!(oneProposition['_id'] in propositionsByIdentifier)){
							propositionsByIdentifier[oneProposition['_id']]=[];
						}
						
						propositionsByIdentifier[oneProposition['_id']].push(oneProposition);
					}
				});
			});
			
			// Search proposition of each incoherence
			allIncoherence.forEach(function(oneIncoherence){
				if("id" in oneIncoherence && oneIncoherence['id'] in propositionsByIdentifier){
					oneIncoherence["propositions"]=propositionsByIdentifier[oneIncoherence['id']];
				}else if("label" in oneIncoherence && oneIncoherence['label'] in propositionsByIdentifier){
					oneIncoherence["propositions"]=propositionsByIdentifier[oneIncoherence['label']];
				}
			});

			return allIncoherence;
		});
	});
}


/**
 * Search incoherence
 * @param coherence
 * @param blacklist
 * @param justOne
 * @returns
 *//*
var getIncoherences=function(coherence,blacklist,justOne){
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");

	var request=new Request(allCoherences[coherence].getParams("search_desc")['request']);
	
	var promises=[ 
	    RedisUtility.getDataException(redisExceptRegexp)
	        .then(function(dataException){
	        	// Add validate in progress to blacklist
	        	return blacklist.concat(dataException);
	        }),
	    request.getResultParser()
    ];
	
	return Q.all(promises).then(function(pormisesResults){
		var blacklistAndException=pormisesResults[0];
		
		var resultParser=pormisesResults[1];
		if(resultParser!=null){
			resultParser
				.addIdBlacklist(blacklistAndException)
				.setLimitResult((justOne) ? 1 : null);
			
			return resultParser.getFormattedResult();
		}
		
		return null;
	});
}

var getPropositions=function(coherence,incoherences){
	var propositions=allCoherences[coherence].getParams("propositions");
	
	var promises=[];
	
	propositions.forEach(function(proposition){
		var field=proposition.field;
		
		var fields=[field];
		
		var search_body=proposition.search;
		var source=proposition.source;
		
		promises.push(pluginUtility.queryInInventaire("source",source,null,search_body,fields).then(function(body){
			var esResult=new ElasticSearchResult();
			esResult.loadFromBodyFields(body);
			
			var identifier=proposition.identifier;
			var identifierType=proposition.identifierType;
			
			var allIdentifiers=[];
			incoherences.forEach(function(incoherence){
				if(typeof incoherence !== "undefined" && identifierType in incoherence && incoherence[identifierType]!=null && incoherence[identifierType]!=""){
					allIdentifiers.push(incoherence[identifierType]);
				}
			});
			
			esResult.addWhitelistField(identifier,allIdentifiers)
					.addFormattedField(identifier,"_id",false);
			
			if("value" in proposition){
				esResult.addConstantField(identifierType,proposition.value);
			}else{
				var equalTo=proposition.equalTo;
				
				var id_field=null;
				var label_field=null;
				if(equalTo=="id") id_field=field;
				if(equalTo=="label") label_field=field;
					
				
				esResult.addFormattedField(id_field,"id",false)
						.addFormattedField(label_field,"label",false);
			}
			
			
			return esResult.getFormattedResult();
		}));
	});
	
	return Q.all(promises);
}

var getAllResponses=function(coherence){
	var request=new Request(allCoherences[coherence].getParams("responses")['request']);
	var parser=request.getResultParser();
		
	if(parser!=null){
		return parser.then(function(resultParser){
			if(resultParser!=null){
				return resultParser.getFormattedResult();
			}
			
			return null;
		});
	}
	
	return null;
}*/

module.exports = methodStatic;