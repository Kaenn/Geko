/**
 * Middleware permettant de centraliser toutes les actions sur les propositions.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var Q = require('q');
var pluginUtility = require('./pluginUtility');


// Enregistrement de toutes les propositions
var allPropositions=[];
var propositionsName=['testProp'];

// Action for all coherence
propositionsName.forEach(function(name){
	// get coherence class
	var propositionClass=require("../../propositions/"+name);
	allPropositions[name]=propositionClass;
});


function getNbCoherence(coherence){
	var fields=allCoherences[coherence].getParams("fields");
	var search_body=allCoherences[coherence].getParams("search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	return pluginUtility.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),search_body,[],false).then(function(body){
		return body.hits.total;
	})
	.catch(console.log);
}


/** 
 * Search incoherence and get proposition
 * @param coherence
 * @param blacklist
 * @returns
 */
function getIncoherenceAndPropositions(coherence,blacklist,justOne){
	return getIncoherences(coherence,blacklist,justOne).then(function(allIncoherence){
		var allIncoherenceId=[];
		allIncoherence.forEach(function(oneIncoherence){
			if(typeof oneIncoherence !== "undefined" && "id" in oneIncoherence && oneIncoherence.id!=null && oneIncoherence.id!=""){
				allIncoherenceId.push(oneIncoherence.id);
			}
		});
		
		return getPropositions(coherence,allIncoherenceId).then(function(allPropositions){
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
				}
			});

			return allIncoherence;
		});
	});
}

function getIncoherences(coherence,blacklist,justOne){
	var fields=allCoherences[coherence].getParams("fields");
	var search_body=allCoherences[coherence].getParams("search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	return pluginUtility.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),search_body,blacklist,justOne).then(function(body){
		return getFieldsInSearchBody(body,[{name:fields[0],label:"id"},{name:fields[1],label:"label"}]);
	});
}

function getPropositions(coherence,ids){
	var propositions=allCoherences[coherence].getParams("propositions");
	
	var promises=[];
	
	propositions.forEach(function(proposition){
		var field=proposition.field;
		var fieldIdentifier=proposition.fieldIdentifier;
		
		var fields=[field,fieldIdentifier];
		
		var search_body=proposition.search;
		var equalTo=proposition.equalTo;
		var source=proposition.source;
		
		var terms={};
		terms[fieldIdentifier]=ids;
		var filter={
	        "terms" : terms
		}
		
		promises.push(pluginUtility.queryInInventaire("source",source,filter,search_body,fields).then(function(body){
			var id_field=null;
			var label_field=null;
			
			if(equalTo=="id") id_field=field;
			if(equalTo=="label") label_field=field;
			
			return getFieldsInSearchBody(body,[{name:fieldIdentifier,label:"_id"},{name:id_field,label:"id"},{name:label_field,label:"label"}]);
		}));
	});
	
	
	return Q.all(promises);
}

function getAllResponses(coherence){
	var fields=allCoherences[coherence].getParams("responses_fields");
	var search_body=allCoherences[coherence].getParams("responses_search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"responses","*");
	return pluginUtility.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("responses_source"),search_body,[],false).then(function(body){
		return getFieldsInSearchBody(body,[{name:fields[0],label:"id"},{name:fields[1],label:"label"}]);
	});
}

function getFullIncoherences(coherence,blacklist,justOne){
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


function getNextIncoherence(coherence,blacklist){
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

function getAllIncoherences(coherence){
	return getFullIncoherences(coherence,[],false);
}


function validateMultipleIncoherence(coherence,responses){
	var promises=[];
	
	responses.forEach(function(oneResponse){
		promises.push(validateIncoherence(coherence,oneResponse.id,oneResponse.responses));
	});
	
	return Q.all(promises);
}

function validateIncoherence(coherence,id,responses){
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


function getKeyDataException(coherence,type,id){
	return "coherence:exception:"+coherence+":"+type+":"+id;
}

function getFieldsInSearchBody(body,mapping_fields){
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

exports.getNbCoherence = getNbCoherence;
exports.getAllIncoherences = getAllIncoherences;
exports.getNextIncoherence = getNextIncoherence;
exports.validateIncoherence = validateIncoherence;
exports.validateMultipleIncoherence = validateMultipleIncoherence;