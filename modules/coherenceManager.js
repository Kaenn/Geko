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
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	dataInventaireManager.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),allCoherences[coherence].getParams("search"),[],false).then(function(body){
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
function getIncoherenceAndProposition(coherence,blacklist){
	var index="source";
	var type=allCoherences[coherence].getParams("source");
	return getIncoherence(coherence,index,type,blacklist).then(function(incoherence){
		var id=null;
		var label=null;
		
		if(typeof incoherence !== "undefined"){
			if("id" in incoherence)
	    		id=incoherence.id;
	    	
	    	if("label" in incoherence)
	    		label=incoherence.label;
		}
		/*return dataInventaireManager.getPropositionOfIncoherence(index,type,id,"proposition").then(function(proposition){
			return {
				id: id,
				label:label,
				proposition: proposition
			}
		});*/
		return {
			id: id,
			label:label
		};
	});
}

function getIncoherence(coherence,index,type,blacklist){
	var fields=allCoherences[coherence].getParams("fields");
	var search_body=allCoherences[coherence].getParams("search");
	search_body["fields"]=fields;
	
	var redisExceptRegexp=getKeyDataException(coherence,"validate","*");
	return dataInventaireManager.searchInInventaire(redisExceptRegexp,"source",allCoherences[coherence].getParams("source"),search_body,blacklist,true).then(function(body){
		return getFieldsInSearchBody(body,fields[0],fields[1]).shift();
	});
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
	    getIncoherenceAndProposition(coherence,blacklist).then(function(r){
	    	return r;
	    }),
	    getAllResponses(coherence).then(function(r){
	    	return r;
	    })
	];

    return Q.all(promises).then(function(response){
    	var incoherence=response.shift();
    	var input=response.shift();
		
    	var proposition=null;
    	var id=null;
    	var label=null;
    	
    	if(typeof incoherence !== "undefined"){
	    	if("id" in incoherence)
	    		id=incoherence.id;
	    	
	    	if("label" in incoherence)
	    		label=incoherence.label;
	    	
	    	if("proposition" in incoherence){
		    	input.forEach(function(oneInput){
		    		if(oneInput.label==incoherence.proposition){
		    			proposition=oneInput;
		    		}
		    	});
	    	}
    	}
    	
		client.emit("get-next-incoherence",coherence,id,label,input,proposition);
    })
    .catch(console.log);
}


function getAllIncoherence(client,coherence,outil,target){
	dataInventaireManager.searchInInventaire("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["_id", "label"],allCoherences[coherence].getParams("query"),[],false).then(function(body){
		var allIncoherence=[];

		if(body.hits.hits.length > 0){
			var hits=body.hits.hits;
			hits.forEach(function(hit){
				var fields=hit['fields'];
				if("label" in fields)
					allIncoherence.push({"id":hit['_id'],"label":fields.label.shift()});
			});
		}

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
				
				if(id_field in fields && label_field in fields){
					var row={};
					// Get id field
					var field_id=fields[id_field];
					if(Array.isArray(field_id))		
						row["id"]=field_id[0];
					else
						row["id"]=field_id;
					
					// Get label field
					var field_label=fields[label_field];
					if(Array.isArray(field_label))		
						row["label"]=field_label[0];
					else
						row["label"]=field_label
					
					returnFields.push(row);
				}
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
	
	/*client.on('get-all-incoherence', function(coherence,outil,target) {
		// Return all coherence to client
		getAllIncoherence(client,coherence,outil,target);
	});*/
	
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