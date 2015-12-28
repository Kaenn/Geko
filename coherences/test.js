function refreshNbCoherence(coherence,outil,target){
	return 15;
}

function listeCoherence(coherence,outil,target,justOne,blacklist){
	var allIncoherence=[
	     {"id": 1 ,"label" : "host1"},
	     {"id": 2 ,"label" : "host2"},
	     {"id": 3 ,"label" : "host3"}
	];
	
	if(justOne){
		var theIncoherence=null;
		
		allIncoherence.forEach(function(incoherenceDesc){
			if(!blacklist.contains(incoherenceDesc.desc)){
				theIncoherence=incoherenceDesc;
				return false;
			}
		});
		
		return theIncoherence;
	}
	
	return allIncoherence;
}


function getQueryElasticSearch(){
	return {
		"term" : { "isIncoherence" : true }
	};
}

function getInput(){
	return ["input1","input2","input3","input4"];
}

function getProposition(){
	return { "value" : "input3" };
}

exports.refreshNbCoherence = refreshNbCoherence;
exports.listeCoherence = listeCoherence;
exports.getQueryElasticSearch = getQueryElasticSearch;
exports.getInput = getInput;
exports.getProposition = getProposition;