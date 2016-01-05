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
	
	// Add getData coherence to scheduler
	dataInventaireManager.addSchedulerDataCoherence("coherence_"+name,"data",coherenceClass.getTimerMS(),coherenceClass.getData);
	dataInventaireManager.addSchedulerDataCoherence("coherence_"+name,"propositions",coherenceClass.getTimerMS(),coherenceClass.getDataPropositions);
});


function refreshNbCoherence(clients,coherence,outil,target){
	dataInventaireManager.searchInInventaire("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',['_id'],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	});
}

/** 
 * Search incoherence and get proposition
 * @param coherence
 * @param blacklist
 * @returns
 */
function getIncoherenceAndProposition(coherence,blacklist){
	var index='coherence_'+coherence;
	var type='data';
	return getIncoherence(coherence,index,type,blacklist).then(function(incoherence){
		var id=incoherence.id;
		var label=incoherence.label;
		
		return dataInventaireManager.getPropositionOfIncoherence(index,type,id,"proposition").then(function(proposition){
			return {
				id: id,
				label:label,
				proposition: proposition
			}
		});
	});
}

function getIncoherence(coherence,index,type,blacklist){
	return dataInventaireManager.searchInInventaire("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["_id", "label"],allCoherences[coherence].getQueryElasticSearch(),blacklist,true).then(function(body){
		var id=null;
		var label=null;
		
		if(body.hits.hits.length > 0){
			var hit=body.hits.hits.shift();
			id=hit['_id'];
			var fields=hit['fields'];
			if("label" in fields)
				label=fields.label;
		}
		
		return {
			id: id,
			label: label
		};
	});
}

function getAllPropositions(coherence){
	return dataInventaireManager.searchInInventaire("coherence:"+coherence+":propositions:*",'coherence_'+coherence,'propositions',["_source"],null,[],false).then(function(body){
		var input=[];
		if(body.hits.hits.length > 0){
			var hits=body.hits.hits;
			
			hits.forEach(function(hit){
				var idProposition=hit['_id'];
				var source=hit['_source'];
				if("label" in source)
					input.push({"id":idProposition,"label":source.label});
			});
		}
		return input;
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	var promises = [
	    getIncoherenceAndProposition(coherence,blacklist),
	    getAllPropositions(coherence)
	];

    return Q.all(promises).then(function(response){
    	var incoherence=response.shift();
    	var input=response.shift();
		
    	var proposition=null;
    	input.forEach(function(oneInput){
    		if(oneInput.label==incoherence.proposition){
    			proposition=oneInput;
    		}
    	});

		client.emit("get-next-incoherence",coherence,incoherence.id,incoherence.label,input,proposition);
    })
    .catch(console.log);
}


function getAllIncoherence(client,coherence,outil,target){
	dataInventaireManager.searchInInventaire("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["_id", "label"],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
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
	dataInventaireManager.addDataException("coherence_"+coherence,"data",id,coherenceClass.getTimer())
	.then(function(){
		// Prevent client of the begin of validate workflow
		client.emit("validate-incoherence",coherence,outil,target);
	});
	
	if(coherenceClass.hasPropositionUnique()){
		responses.forEach(function(response){
			// Add data excpetion for exclude this to the incoherence return
			dataInventaireManager.addDataException("coherence_"+coherence,"propositions",response,coherenceClass.getTimer())
			.then(function(){
				// Prevent client of the begin of validate workflow
				client.emit("validate-incoherence",coherence,outil,target);
			});
		});
	}
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
	
	dataInventaireManager.getPropositionOfIncoherence("coherence_test","data",1,["proposition"]).then(function(proposition){console.log(proposition);});
}

exports.initialize = initialize;