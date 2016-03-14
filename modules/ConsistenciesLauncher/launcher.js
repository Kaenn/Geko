//Recuperation de la variable de config
var config = require('../../config/config');
var Scheduler=require('../Scheduler/Scheduler');

var getRefreshTimer=function(name){
	var params=require("./consistency/"+name+"/params");
	
	return params["refreshTimer"];
}

var getConsistencies=function(name){
	return require("./consistency/"+name+"/consistencies");
}

var getResponses=function(name){
	return require("./consistency/"+name+"/responses");
}

var getSuggestions=function(name){
	return require("./consistency/"+name+"/suggestions");
}


var consistenciesName=config.consistencies;

console.log("Launch all consistencies Scheduler :");
consistenciesName.forEach(function(name){
	if(name!=null && name !=""){
		var refreshTimer=getRefreshTimer(name);

		Scheduler.addSchedulerData("consistency_"+name,"consistency",refreshTimer,getConsistencies(name));
		Scheduler.addSchedulerData("consistency_"+name,"consistency_responses",refreshTimer,getResponses(name));
		Scheduler.addSchedulerData("consistency_"+name,"consistency_suggestions",refreshTimer,getSuggestions(name));
		
		console.log(" * Consistency '"+name+"' is launch.");
	}
});
console.log("All consistencies launch.");

