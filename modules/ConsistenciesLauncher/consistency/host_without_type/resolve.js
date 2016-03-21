var Q = require('q');

var resolve=function(){
	var deferred = Q.defer();
	console.log("TODO : resolve");
	return Q.fcall(function () {
	    return null;
	});
}


module.exports = resolve;