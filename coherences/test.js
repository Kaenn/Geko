function getQueryElasticSearch(){
	return {
		"term" : { "isIncoherent" : true }
	};
}

function getInput(){
	return ["input1","input2","input3","input4"];
}

function getProposition(){
	return { "value" : "input3" };
}

exports.getQueryElasticSearch = getQueryElasticSearch;
exports.getInput = getInput;
exports.getProposition = getProposition;