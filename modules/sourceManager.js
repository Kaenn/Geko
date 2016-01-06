/**
 * Middleware permettant de centraliser toutes les actions sur les sources.
 * 
 * @author : Kaenn
 */
var Q = require('q');
var dataInventaireManager = require('./dataInventaireManager');


// Enregistrement de toutes les sources
var allSources=[];
var sourcesName=['source1','sourceResponses1'];

function launchSourcesScheduler(){
	console.log("Launch all sources Scheduler :");
	sourcesName.forEach(function(name){
		// get source class
		var sourcesClass=require("../sources/"+name);
		allSources[name]=sourcesClass;
		
		// Add getDataFromSource to scheduler
		dataInventaireManager.addSchedulerData("source",name,sourcesClass.getParams("refreshTimer"),sourcesClass.getDataFromSource);
		console.log(" * Source '"+name+"' is launch.");
	});
}


exports.launchSourcesScheduler = launchSourcesScheduler;