var method = Custom.prototype;

/**
 * Constructeur
 */
function Custom(params) {
	this._customFunction = null;
    
    this.parseParams(params);
}

/**
 * Parse param for get parameters
 */
method.parseParams = function(params){
	if("custom_function" in params)
		this._customFunction=params["custom_function"];
};

// Retourne le resultar formatter 
method.getResult = function() {
	return this._customFunction();
};


module.exports = Custom;