/**
 * @author : Kaenn
 */
var extend = require('util')._extend;

var default_config={
	timerBlacklist : 0, // Time in blacklist after resolve an incoherence (in seconde)
	search_desc : null,
	responses :null,
	propositions: null
}


function Coherence(config,resolve) {
	this.config=extend({},default_config,config);
	this.resolve=resolve;
};

Coherence.prototype.getParams = function(name) {
	if(name in params){
		return params[name];
	}
	return null;
}

//export the class
module.exports = Coherence;