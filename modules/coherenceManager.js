/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var Q = require('q');
var dataCoherenceManager = require('./dataCoherenceManager');


// Enregistrement de toutes les coherences
var allCoherences=[];
var coherencesName=['test'];

// Action for all coherence
coherencesName.forEach(function(name){
	// get coherence class
	var coherenceClass=require("../coherences/"+name);
	allCoherences[name]=coherenceClass;
	
	// Add getData coherence to scheduler
	dataCoherenceManager.addSchedulerDataCoherence("coherence_"+name,"data",coherenceClass.getTimerMS(),coherenceClass.getData);
	dataCoherenceManager.addSchedulerDataCoherence("coherence_"+name,"propositions",coherenceClass.getTimerMS(),coherenceClass.getDataPropositions);
});


function refreshNbCoherence(clients,coherence,outil,target){
	dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',['_id'],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	var promises = [
	    dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["_id", "label"],allCoherences[coherence].getQueryElasticSearch(),blacklist,true),
	    dataCoherenceManager.searchCoherence("coherence:"+coherence+":propositions:*",'coherence_'+coherence,'propositions',["_source"],null,[],false)
	];

    return Q.all(promises).then(function(body){
    	var bodyIncoherence=body.shift();
    	var bodyInput=body.shift();

    	var id=null;
		var label=null;
		var input=allCoherences[coherence].getInput();
		var proposition=allCoherences[coherence].getProposition();
		
		if(bodyIncoherence.hits.hits.length > 0){
			var hit=bodyIncoherence.hits.hits.shift();
			id=hit['_id'];
			var fields=hit['fields'];
			if("label" in fields)
				label=fields.label;
		}
		
		var input=[];
		if(bodyInput.hits.hits.length > 0){
			var hits=bodyInput.hits.hits;
			
			hits.forEach(function(hit){
				var idProposition=hit['_id'];
				var source=hit['_source'];
				if("label" in source)
					input.push({"id":idProposition,"label":source.label});
			});
		}
		
		client.emit("get-next-incoherence",coherence,id,label,input,proposition);
    })
    .catch(console.log);
}


function getAllIncoherence(client,coherence,outil,target){
	dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["_id", "label"],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
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
	dataCoherenceManager.addDataException("coherence_"+coherence,"data",id,coherenceClass.getTimer())
	.then(function(){
		// Prevent client of the begin of validate workflow
		client.emit("validate-incoherence",coherence,outil,target);
	});
	
	if(coherenceClass.hasPropositionUnique()){
		responses.forEach(function(response){
			// Add data excpetion for exclude this to the incoherence return
			dataCoherenceManager.addDataException("coherence_"+coherence,"propositions",response,coherenceClass.getTimer())
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
}

exports.initialize = initialize;