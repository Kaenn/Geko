var method = Request.prototype;

var ResultParser = require("./ResultParser");

/* Load all requester */
var Custom = require("./requester/Custom");


/**
 * Constructeur
 */
function Request(params) {
	this._type = null;
    this._params = null;
    this._checks = null;
    this._idField = null;
    this._labelField = null;
    
    this.parseParams(params);
}

/**
 * Parse param for get parameters
 */
method.parseParams = function(params){
	if("type" in params)
		this._type=params["type"];
	if("params" in params)
		this._params=params["params"];
	if("checks" in params)
		this.checks=params["checks"];
	if("idField" in params)
		this._idField=params["idField"];
	if("labelField" in params)
		this._labelField=params["labelField"];
};


/**
 * Do request with params
 */
method.getResultParser = function() {
	var that=this;
	
    // Search the requester
	var requester=getRequester(this._type,this._params);
    
	// Get the result
    if(requester!==null){
    	return requester.getResult()
    	.then(function(result){
    		// Parse the result
    	    var parser=new ResultParser(result);
    	    
    	    parser
    			.addIdField(that._idField)
    			.addLabelField(that._labelField);
    	    
    	    for(field_name in that._checks){
    	    	var check=that._checks[field_name];
    	    	parser.addCheckField(field_name,check);
    	    }

    	    return parser;
    	});
    }
    return null;
};


/* PRIVATE FUNCTION */

/**
 * retourne la bonne class de requete en fonction du type dans le param
 */
function getRequester(type,params){
	switch(type){
		case "custom" : return new Custom(params); break;
	}
	
	return null;
}

module.exports = Request;