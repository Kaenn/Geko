/**
 * Middleware permettant de centraliser toutes les actions sur les sources.
 * 
 * @author : Kaenn
 */
var Scheduler=require('./Scheduler/Scheduler');

// Enregistrement de toutes les sources
var sourcesName=config.sources;

/*
var ipplan_ip_source=require("../../sources/snmp_ip");
ipplan_ip_source.getDataFromSource().then(function(data){
	updateDataToES("source","snmp_ip",data);
})
.catch(console.log);*/

function launchSourcesScheduler(){
	console.log("Launch all sources Scheduler :");
	sourcesName.forEach(function(name){
		// get source class
		var sourcesClass=require("./sources/"+name);
		
		// Add getDataFromSource to scheduler
		Scheduler.addSchedulerData("source",name,sourcesClass.refreshTimer,sourcesClass.getDataFromSource);
		console.log(" * Source '"+name+"' is launch.");
	});
	console.log("All sources launch.");
}

exports.launchSourcesScheduler = launchSourcesScheduler;