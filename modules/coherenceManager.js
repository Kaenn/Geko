/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var Q = require('q');
var dataInventaireManager = require('./dataInventaireManager');


// Enregistrement de toutes les coherences
var allCoherences=[];
var coherencesName=['test'];

// Action for all coherence
coherencesName.forEach(function(name){
	// get coherence class
	var coherenceClass=require("../coherences/"+name);
	allCoherences[name]=coherenceClass;
});


function refreshNbCoherence(clients,coherence,outil,target){
	var fields=allCoherences[coherence].getParams("fields");
	var search_body=allCoherences[coherence].getParams("search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	dataInventaireManager.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),search_body,[],false).then(function(body){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	})
	.catch(console.log);
}

/** 
 * Search incoherence and get proposition
 * @param coherence
 * @param blacklist
 * @returns
 */
function getIncoherenceAndPropositions(coherence,blacklist){
	return getIncoherences(coherence,blacklist,true).then(function(incoherence){
		var id=null;
		var label=null;
		
		if(typeof incoherence !== "undefined"){
			if("id" in incoherence)
	    		id=incoherence.id;
	    	
	    	if("label" in incoherence)
	    		label=incoherence.label;
		}
		
		if(id!=null && id!=""){
			return getPropositions(coherence,id).then(function(propositions){
				return {
					id: id,
					label:label,
					propositions: propositions
				}
			});
		}else{
			return {
				id: id,
				label:label
			}
		}
	});
}

function getIncoherences(coherence,blacklist,justOne){
	var fields=allCoherences[coherence].getParams("fields");
	var search_body=allCoherences[coherence].getParams("search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	return dataInventaireManager.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),search_body,blacklist,justOne).then(function(body){
		if(justOne)
			return getFieldsInSearchBody(body,fields[0],fields[1]).shift();
		else
			return getFieldsInSearchBody(body,fields[0],fields[1]);
	});
}

function getPropositions(coherence,id){
	var propositions=allCoherences[coherence].getParams("propositions");
	
	var promises=[];
	
	propositions.forEach(function(proposition){
		var field=proposition.field;
		var search_body=proposition.search;
		var equalTo=proposition.equalTo;
		var source=proposition.source;
		
		promises.push(dataInventaireManager.queryInInventaire("source",source,id,search_body,field).then(function(body){
			var id_field=null;
			var label_field=null;
			
			if(equalTo=="id") id_field=field;
			if(equalTo=="label") label_field=field;

			return getFieldsInSearchBody(body,id_field,label_field).shift();
		}));
	});
	
	
	return Q.all(promises);
}

function getAllResponses(coherence){
	var fields=allCoherences[coherence].getParams("responses_fields");
	var search_body=allCoherences[coherence].getParams("responses_search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"responses","*");
	return dataInventaireManager.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("responses_source"),search_body,[],false).then(function(body){
		return getFieldsInSearchBody(body,fields[0],fields[1]);
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	var promises = [
	    getIncoherenceAndPropositions(coherence,blacklist),
	    getAllResponses(coherence)
	];

    return Q.all(promises).then(function(response){
    	var incoherence=response.shift();
    	var input=response.shift();
		
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
		    			input.forEach(function(oneInput){
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
    	
		client.emit("get-next-incoherence",coherence,id,label,input,propositions);
    })
    .catch(console.log);
}


function getAllIncoherence(client,coherence,outil,target){
	getIncoherences(coherence,[],false).then(function(allIncoherence){		
		client.emit("get-all-incoherence",coherence,outil,target, allIncoherence);
	});
}



function validateIncoherence(client,coherence,outil,target,id,responses){
	var coherenceClass=allCoherences[coherence];
	// launch resolve action
	coherenceClass.resolve(id,responses);
	
	// Add data excpetion for exclude this to the incoherence return
	dataInventaireManager.addDataException(getKeyDataException(coherence,"validate",id),id,coherenceClass.getParams("timerBlacklist"))
	.then(function(){
		// Prevent client of the begin of validate workflow
		client.emit("validate-incoherence",coherence,outil,target);
	});
	
	if(coherenceClass.getParams("responseIsUnique")){
		responses.forEach(function(response){
			// Add data excpetion for exclude this to the incoherence return
			dataInventaireManager.addDataException(getKeyDataException(coherence,"responses",response),response,coherenceClass.getParams("timerBlacklist"))
			.then(function(){
				// Prevent client of the begin of validate workflow
				client.emit("validate-incoherence",coherence,outil,target);
			});
		});
	}
}


function getKeyDataException(coherence,type,id){
	return "coherence:exception:"+coherence+":"+type+":"+id;
}

function getFieldsInSearchBody(body,id_field,label_field){
	var returnFields=[];
	
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				var fields=hit['fields'];
				
				var row={};
				
				if(id_field in fields){
					// Get id field
					var field_id=fields[id_field];
					if(Array.isArray(field_id))		
						row["id"]=field_id[0];
					else
						row["id"]=field_id;
				}
				
				if(label_field in fields){
					// Get label field
					var field_label=fields[label_field];
					if(Array.isArray(field_label))		
						row["label"]=field_label[0];
					else
						row["label"]=field_label
				}
				
				if(Object.keys(row).length > 0)
					returnFields.push(row);
			}
		});
	}
	
	return returnFields;
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