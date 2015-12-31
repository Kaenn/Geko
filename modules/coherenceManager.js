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
	allCoherences[name]=require("../coherences/"+name);
	
	// Add getData coherence to scheduler
	dataCoherenceManager.addSchedulerDataCoherence("coherence_"+name,"data",3000,allCoherences[name].getData);
});


function refreshNbCoherence(clients,coherence,outil,target){
	dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',['id'],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["id", "label"],allCoherences[coherence].getQueryElasticSearch(),blacklist,true).then(function(body){
		var id=null;
		var label=null;
		var input=allCoherences[coherence].getInput();
		var proposition=allCoherences[coherence].getProposition();
		
		if(body.hits.hits.length > 0){
			var incoherence=body.hits.hits.shift().fields;
			if("id" in incoherence)
				id=incoherence.id.shift();
			if("label" in incoherence)
				label=incoherence.label.shift();
		}
		
		client.emit("get-next-incoherence",coherence,id,label,input,proposition);
	});
}


function getAllIncoherence(client,coherence,outil,target){
	dataCoherenceManager.searchCoherence("coherence:"+coherence+":validate:*",'coherence_'+coherence,'data',["id", "label"],allCoherences[coherence].getQueryElasticSearch(),[],false).then(function(body){
		client.emit("get-all-incoherence",coherence,outil,target,body.hits.hits.map(function(hit) {
			  return { "id" : hit.fields.id.shift(), "label" : hit.fields.label.shift() };
		}));
	});
}



function validateIncoherence(client,coherence,outil,target,id,response){
	// launch resolve action
	allCoherences[coherence].resolve(id,response);
	
	// Add data excpetion for exclude this to the incoherence return
	dataCoherenceManager.addDataException("coherence_"+coherence,"data",id,30)
	.then(function(){
		// Prevent client of the begin of validate workflow
		client.emit("validate-incoherence",coherence,outil,target);
	});
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