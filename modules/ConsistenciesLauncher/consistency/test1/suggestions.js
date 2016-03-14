var Q = require('q');

var getSuggestions=function(){
	var deferred = Q.defer();
	
	/*var data =[
	    { 
	    	"target" : {
    		    "type" : "label",
    		    "target" : "inco1" , 
    	    },
	    	"suggestions" : [
	    	    { "suggestion" : "2", "label" : "reponse2"}
            ]
	    },
	    {
	    	"target" : {
    		    "type" : "id",
    		    "target" : "99" , 
    	    },
	    	"suggestions" : [
	    	    { "suggestion" : "4", "label" : "reponse4"}
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

module.exports = getSuggestions;