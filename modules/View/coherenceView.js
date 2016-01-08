/** 
 * @author : Kaenn
 */
var coherenceManager = require('../API/coherenceManager');


function refreshNbCoherence(clients,coherence,outil,target){
	coherenceManager.getNbCoherence(coherence,outil,target).then(function(nbIncoherence){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,nbIncoherence);
	});
}


function getNextCoherence(client,coherence,outil,target,blacklist){
	coherenceManager.getNextCoherence(coherence,outil,target,blacklist).then(function(nextIncoherence){
		client.emit("get-next-incoherence",coherence,nextIncoherence.id,nextIncoherence.label,nextIncoherence.input,nextIncoherence.propositions);
	});
}


function getAllIncoherence(client,coherence,outil,target){
	coherenceManager.getAllIncoherence(coherence,outil,target).then(function(allIncoherence){
		client.emit("get-all-incoherence",coherence,outil,target, allIncoherence);
	});
}


function validateIncoherence(client,coherence,outil,target,id,responses){
	coherenceManager.validateIncoherence(coherence,coherence,outil,target,id,responses).then(function(allIncoherence){
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