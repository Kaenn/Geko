/**
 * Middleware permettant de centraliser toutes les actions sur les coherences.
 * Source des middleware de coherence : ../coherences/<coherence-name>
 * 
 * @author : Kaenn
 */
var elasticsearch = require('elasticsearch');

var clientElasticsearch = new elasticsearch.Client({
  host: 'localhost:9200'
});

var allCoherences=[];

var coherencesName=['test'];

coherencesName.forEach(function(name){
	allCoherences[name]=require("../coherences/"+name);
});

function refreshNbCoherence(clients,coherence,outil,target){
	clientElasticsearch.search({
		index: 'coherence_'+coherence,
		type: 'data',
		body: {
			"fields" : ["id"],
			"query" : allCoherences[coherence].getQueryElasticSearch()
		}
	}).then(function (body) {
		clients.emit("refresh-nb-incoherence",coherence,outil,target,body.hits.total);
	}, function (error) {
		clients.emit("refresh-nb-incoherence",coherence,outil,target,"error");
	});
}

function getAllIncoherence(client,coherence,outil,target){
	clientElasticsearch.search({
		index: 'coherence_'+coherence,
		type: 'data',
		body: {
			"fields": ["id", "label"],
			"query": allCoherences[coherence].getQueryElasticSearch()
		}
	}).then(function (body) {
		client.emit("get-all-incoherence",coherence,outil,target,body.hits.hits.map(function(hit) {
			  return { "id" : hit.fields.id.shift(), "label" : hit.fields.label.shift() };
		}));
	}, function (error) {
		client.emit("get-all-incoherence",coherence,outil,target,"error");
	});
}

function getNextCoherence(client,coherence,outil,target,blacklist){
	clientElasticsearch.search({
		index: 'coherence_'+coherence,
		type: 'data',
		body: {
			"fields": ["id", "label"],
			"query": allCoherences[coherence].getQueryElasticSearch(),
			"size": 1,
			"filter" : {
				"not" : {
	            	"terms" : { "id" : blacklist}
				}
	        }
		}
	}).then(function (body) {
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
	}, function (error) {
		client.emit("get-next-incoherence",coherence,null,null,null,null);
	});
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