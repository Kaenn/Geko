var Q = require('q');

var getConsistencies=function(){
	var deferred = Q.defer();
	
	var data =[
	    { "id" : 1, "label" : "inco1" },
	    { "id" : 2, "label" : "inco2" },
	    { "id" : 3, "label" : "inco3" }
    ];
	
	return Q.fcall(function () {
	    return data;
	});
}

module.exports = getConsistencies;