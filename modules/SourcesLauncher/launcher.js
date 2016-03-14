//Recuperation de la variable de config
var config = require('../../config/config');
var Scheduler=require('../Scheduler/Scheduler');

var sourcesName=config.sources;
//Launch sources scheduler
console.log("Launch all sources Scheduler :");
sourcesName.forEach(function(name){
	// get source class
	var sourcesClass=require("./sources/"+name);
	
	if("refreshTimer" in sourcesClass && "getDataFromSource" in sourcesClass){
		// Add getDataFromSource to scheduler
		Scheduler.addSchedulerData("source",name,sourcesClass.refreshTimer,sourcesClass.getDataFromSource);
		console.log(" * Source '"+name+"' is launch.");
	}else{
		console.log("Impossible de lancer la source "+name+".");
	}
});
console.log("All sources launch.");