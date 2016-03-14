/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */

var Q = require('q');
//var pluginUtility = require('./pluginUtility');
//var ElasticSearchResult=require('./ElasticSearchResult');
var Request=require('./Request');
var RedisUtility=require('../modele/RedisUtility');


// Enregistrement de toutes les coherences
var allCoherences=[];
var coherencesName=config.coherences;

// Action for all coherence
coherencesName.forEach(function(name){
	// get coherence class
	var coherenceClass=require("./consistency/"+name);
	allCoherences[name]=coherenceClass;
});


var method = ConsistencyManager.prototype;

/**
 * Constructeur
 */
function ConsistencyManager(coherence) {
	this._params=allCoherences[coherence].params;
}


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
 */
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
 */
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
}


setTimeout(function(){
	var c=new ConsistencyManager("ipplan_ip_manquante");
	
	//getIncoherences("ipplan_ip_manquante",[],false).then(console.log);
	getAllResponses("ipplan_ip_manquante").then(console.log);
},3000);

module.exports = ConsistencyManager;