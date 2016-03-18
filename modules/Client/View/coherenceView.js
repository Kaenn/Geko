/** 
 * @author : Kaenn
 */
var Q = require('q');

var ConsistencyGetter = require('../Controler/ConsistencyGetter');

/**
 * Rafraichi le nombre d'incoherence
 * @param clients
 * @param coherence
 * @param outil
 * @param target
 * @returns
 */
function refreshNbCoherence(clients,coherence,outil,target){
	ConsistencyGetter.getIncoherences(coherence,[],false).then(function(incoherences){
		clients.emit("refresh-nb-incoherence",coherence,outil,target,incoherences.length);
	})
	.catch(function(error){
		console.log(error);
		
		client.emit("refresh-nb-incoherence",coherence,outil,target,"error");
	});
}

/**
 * Recupère la prochaine incoherence
 * @param client
 * @param coherence
 * @param outil
 * @param target
 * @param blacklist
 * @returns
 */
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
				    ConsistencyGetter.getResponsesOfElem(coherence,nextIncoherence.id,nextIncoherence.label),
				    ConsistencyGetter.getSuggestionsOfElem(coherence,nextIncoherence.id,nextIncoherence.label)
				];
				
				return Q.all(promises).then(function(retour){
					if(retour.length >= 2){
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
	}).catch(function(error){
		console.log(error);
		
		client.emit("get-next-incoherence",coherence,null,null,null,null);
	});
}

/**
 * Récupère toutes les incoherences
 * @param client
 * @param coherence
 * @param outil
 * @param target
 * @returns
 */
function getAllIncoherence(client,coherence,outil,target){
	ConsistencyGetter.getIncoherences(coherence,[],false).then(function(incoherences){
		var retour=[];
		
		if(incoherences.length > 0){
			var ids=[];
			var labels=[];
			var elems=[];
			incoherences.forEach(function(theIncoherence){
				if("id" in theIncoherence && theIncoherence.id!=null && theIncoherence.id!="") ids.push(theIncoherence.id);
				if("label" in theIncoherence && theIncoherence.label!=null && theIncoherence.label!="") labels.push(theIncoherence.label);
				
				if("id" in theIncoherence && "label" in theIncoherence && theIncoherence.id!=null && theIncoherence.id!="" && theIncoherence.label!=null && theIncoherence.label!=""){
					elems.push({
						"id" : theIncoherence.id,
						"label" : theIncoherence.label
					});
				}
			});
			
			var promises=[
			    ConsistencyGetter.getResponsesOfMultiElems(coherence,ids,labels),
			    ConsistencyGetter.getSuggestionsOfMultiElems(coherence,elems)
			];
			
			return Q.all(promises).then(function(result){
				var allResponses=result.shift();
				var suggestionsByIds=result.shift();
				
				incoherences.forEach(function(inco){
					if("id" in inco && inco.id in suggestionsByIds){
						inco.suggestions=suggestionsByIds[inco.id];
					}
				});
				
				return {
					"incoherences" : incoherences,
					"responses" : allResponses
				};
			});
		}
		
		return {
			"incoherences" : [],
			"responses" : []
		}
	}).then(function(result){
		if(result!=null && "incoherences" in result && "responses" in result){
			client.emit("get-all-incoherence-propositions",coherence,outil,target, result.incoherences);
			client.emit("get-all-incoherence-resolutions",coherence,outil,target, result.incoherences,result.responses);
			client.emit("refresh-nb-incoherence",coherence,outil,target, result.incoherences.length);
		}
	}).catch(console.log);
}


function validateIncoherence(client,coherence,outil,target,id,responses){
	ConsistencyGetter.validateIncoherence(coherence,id,responses).then(function(){
		console.log("validate");
		client.emit("validate-incoherence",coherence,outil,target);
	});
}

function validateMultipleIncoherence(client,coherence,outil,target,responses){
	ConsistencyGetter.validateMultipleIncoherence(coherence,responses).then(function(){
		getAllIncoherence(client,coherence,outil,target);
	}).catch(console.log);
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