/** 
 * @author : Kaenn
 */
var coherenceManager = require('../API/coherenceManager');


function refreshNbCoherence(clients,coherence,outil,target){
	coherenceManager.getNbCoherence(coherence).then(function(nbIncoherence){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,nbIncoherence);
	});
}


function getNextIncoherence(client,coherence,outil,target,blacklist){
	coherenceManager.getNextIncoherence(coherence,blacklist).then(function(nextIncoherence){
		if(nextIncoherence!=null)
			client.emit("get-next-incoherence",coherence,nextIncoherence.id,nextIncoherence.label,nextIncoherence.responses,nextIncoherence.propositions);
		else
			client.emit("get-next-incoherence",coherence,null,null,null,null);
	})
	.catch(console.log);
}


function getAllIncoherence(client,coherence,outil,target){
	coherenceManager.getAllIncoherences(coherence).then(function(allIncoherencesWithResponses){
		var allIncoherences=[];
		var responses=[];
		if("incoherences" in allIncoherencesWithResponses){
			allIncoherences=allIncoherencesWithResponses["incoherences"];
			
			if("responses" in allIncoherencesWithResponses)
				responses=allIncoherencesWithResponses["responses"];
		}
		
		client.emit("get-all-incoherence-propositions",coherence,outil,target, allIncoherences);
		client.emit("get-all-incoherence-resolutions",coherence,outil,target, allIncoherences,responses);
		client.emit("refresh-nb-incoherence",coherence,outil,target, allIncoherences.length);
	});
}


function validateIncoherence(client,coherence,outil,target,id,responses){
	coherenceManager.validateIncoherence(coherence,id,responses).then(function(allIncoherence){
		client.emit("validate-incoherence",coherence,outil,target);
	});
}

function validateMultipleIncoherence(client,coherence,outil,target,responses){
	coherenceManager.validateMultipleIncoherence(coherence,responses).then(function(){
		getAllIncoherence(client,coherence,outil,target);
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
		getNextIncoherence(client,coherence,outil,target,blacklist);
	});
	
	client.on('validate-incoherence', function(coherence,outil,target,id,responses) {
		// Validate incoherence
		validateIncoherence(client,coherence,outil,target,id,responses);
	});
	
	client.on('validate-multiple-incoherence', function(coherence,outil,target,responses) {
		// Validate incoherence
		validateMultipleIncoherence(client,coherence,outil,target,responses);
	});
}

exports.initialize = initialize;