var Q = require('q');

var getResponses=function(){
	var deferred = Q.defer();
    
	/*var data=[
	    { 
	    	"target" : {
    		    "type" : "label",
    		    "target" : "inco1" , 
    	    },
	    	"responses" : [
	    	    { "response" : "1", "label" : "reponse1"},
	    	    { "response" : "2", "label" : "reponse2"}
            ]
	    },
	    {
	    	"target" : {
    		    "type" : "id",
    		    "target" : "2" , 
    	    },
	    	"responses" : [
	    	    { "response" : "3", "label" : "reponse3"},
	    	    { "response" : "4", "label" : "reponse4"}
            ]
	    },
	    {
	    	"target" : {
    		    "type" : "all" 
    	    },
	    	"responses" : [
	    	    { "response" : "5", "label" : "reponse5"},
	    	    { "response" : "6", "label" : "reponse6"}
            ]
	    }
    ];*/
	
	var data=[
	    {
	    	"response_id" : "1",
	    	"response_label" : "reponse1",
	    	"target": [
	    	    {
	    	    	"id" : "2"
	    	    }     
            ]
	    },
	    {
	    	"response_id" : "2",
	    	"response_label" : "reponse2",
	    	"target": [
	    	    {
	    	    	"label" : "inco1"
	    	    }     
            ]
	    },
	    {
	    	"response_id" : "3",
	    	"response_label" : "reponse3",
	    	"target": [
	    	    {
	    	    	"all" : true
	    	    }     
            ]
	    }
	];
	
	return Q.fcall(function () {
	    return data;
	});
}


module.exports = getResponses;