var Q = require('q');

var getSuggestions=function(){
	var deferred = Q.defer();
	// Aucune suggestions
	return Q.fcall(function () {
	    return [];
	});
}

module.exports = getSuggestions;