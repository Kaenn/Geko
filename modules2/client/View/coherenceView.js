/** 
 * @author : Kaenn
 */
var ConsistencyGetter = require('../Controler/ConsistencyGetter');

function refreshNbCoherence(clients,coherence,outil,target){
	ConsistencyGetter.getIncoherences(coherence,[],false).then(function(incoherences){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,incoherences.length);
	});
}


function getNextIncoherence(client,coherence,outil,target,blacklist){
	ConsistencyGetter.getIncoherences(coherence,blacklist,true).then(function(incoherences){
		var nextIncoherence={
			"coherence" : coherence,
			"id" : null,
			"label" : null,
			"responses" : null,
			"suggestions" :null
		};
		
		if(incoherences.length > 0){
			var theIncoherence=incoherences.shift();
			
			if("id" in theIncoherence && "label" in theIncoherence){
				nextIncoherence.id=theIncoherence.id;
				nextIncoherence.label=theIncoherence.label;
			
				// On recherche les réponses possible et les suggestions pour ce host
				var promises=[
				    ConsistencyGetter.getResponses(coherence,nextIncoherence.id,nextIncoherence.label),
				    ConsistencyGetter.getSuggestions(coherence,nextIncoherence.id,nextIncoherence.label)
				];
				
				return Q.all(promises,function(retour){
					if(retour.length > 2){
						nextIncoherence.responses=retour.shift();
						nextIncoherence.suggestions=retour.shift();
					}
					
					return nextIncoherence;
				});
			}
		}
		
		return nextIncoherence;
	}).then(function(nextIncoherence){
		client.emit("get-next-incoherence",nextIncoherence.coherence,nextIncoherence.id,nextIncoherence.label,nextIncoherence.responses,nextIncoherence.suggestions);
	})
	.catch(function(error){
		console.log(error);
		
		client.emit("get-next-incoherence",coherence,null,null,null,null);
	});
}


function getAllIncoherence(client,coherence,outil,target){
	var promises=[
	    ConsistencyGetter.getIncoherences(coherence,[],false),
	    ConsistencyGetter.getAllResponses(coherence)
	];
	
	//Continuer HERE
	Q.all(promises,function(retour){
		//incoherence.
	});
	
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