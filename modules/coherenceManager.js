/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var allCoherences=[];

var coherencesName=['test'];

coherencesName.forEach(function(name){
	allCoherences[name]=require("../coherences/"+name);
});

function refreshNbCoherence(clients,coherence,outil,target){
	clients.emit("refresh-nb-incoherence",coherence,outil,target,allCoherences[coherence].refreshNbCoherence(coherence,outil,target));
}

function getAllIncoherence(client,coherence,outil,target){
	client.emit("get-all-incoherence",coherence,allCoherences[coherence].listeCoherence(coherence,outil,target,false,[]));
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	client.emit("get-next-incoherence",coherence,allCoherences[coherence].listeCoherence(coherence,outil,target,true,blacklist));
}


/**
 * Initialise la page du client et ses events
 */
var initialize=function(client,clients){
	client.on('refresh-nb-incoherence', function(coherence,outil,target) {
		// On refresh le nombre de coherence sur tous les clients
		refreshNbCoherence(clients,coherence,outil,target);
	});
	
	client.on('get-all-incoherence', function(coherence,outil,target) {
		// On retourne, au client qui le demande, toutes les incoherences de cette coherence
		getAllIncoherence(client,coherence,outil,target);
	});
	
	client.on('get-next-incoherence', function(coherence,outil,target,blacklist) {
		// On retourne, au client qui le demande, toutes les incoherences de cette coherence
		getNextCoherence(client,coherence,outil,target,blacklist);
	});
}

exports.initialize = initialize;