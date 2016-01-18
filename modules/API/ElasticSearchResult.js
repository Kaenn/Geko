/**
 * @author : Kaenn
 */
var Q = require('q');

//Constructor
function ElasticSearchResult() {
  this.result = [];
  this.blacklistFields = {};
  this.whitelistFields = {};
  this.formattedFields = [];
  this.constantFields = {};
}

/**
 * Get result from elasticsearch search field
 * @param body
 * @returns {ElasticSearchResult}
 */
ElasticSearchResult.prototype.loadFromBodyFields = function(body) {
	var that=this;
	
	// initialize result
	that.result=[];
	// search the fils of body search of elasticsearch
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				that.result.push(hit['fields']);
			}
		});
	}

	return this;
};


/**
 * Add blacklist in field
 * @param field_name
 * @param blacklist
 * @returns {ElasticSearchResult}
 */
ElasticSearchResult.prototype.addBlacklistField = function(field_name,blacklist) {
	this.blacklistFields[field_name]=blacklist;
	
	return this;
};

/**
 * Check if row is in blacklist
 * @param row
 * @returns {Boolean}
 */
ElasticSearchResult.prototype.isInBlacklist = function(row) {
	for(var field_name in this.blacklist){
		var blacklistOfField=this.blacklist[field_name];
		
		var values=row[field_name];
		if(!Array.isArray(values)) values=[values];
		
		var isIn=false;
		values.forEach(function(val){
			if(blacklistOfField.indexOf(val) >= 0) isIn=true;
		});
		if(isIn) return false;
	}
	
	return true;
};

/**
 * Add blacklist in field
 * @param field_name
 * @param blacklist
 * @returns {ElasticSearchResult}
 */
ElasticSearchResult.prototype.addWhitelistField = function(field_name,whitelist) {
	this.whitelistFields[field_name]=whitelist;
	
	return this;
};

/**
 * Check if row is in blacklist
 * @param row
 * @returns {Boolean}
 */
ElasticSearchResult.prototype.isInWhitelist = function(row) {
	for(var field_name in this.whitelistFields){
		var whitelistOfField=this.whitelistFields[field_name];
		
		var values=row[field_name];
		if(!Array.isArray(values)) values=[values];
		
		var isIn=false;
		values.forEach(function(val){
			if(whitelistOfField.indexOf(val) >= 0) isIn=true;
		});
		if(isIn) return true;
	}
	
	return false;
};

/**
 * Check if row is usefull
 * @param row
 * @returns
 */
ElasticSearchResult.prototype.useThisRow = function(row) {
	// If have withlist search if row is in
	if(Object.keys(this.whitelistFields).length > 0){
		return this.isInWhitelist(row);
	// If have blacklist search if row is not in
	}else if(Object.keys(this.blacklist).length > 0){
		return !this.isInBlacklist(row);
	}
	
	return true;
};

ElasticSearchResult.prototype.addConstantField = function(field_name,constant) {
	this.constantFields[field_name]=constant;
	
	return this;
};

/**
 * Add format to field
 * @param field_name
 * @param new_field_name
 * @param isArray
 * @returns {ElasticSearchResult}
 */
ElasticSearchResult.prototype.addFormattedField = function(field_name,new_field_name,isArray) {
	this.formattedFields.push({
		"fieldName" : field_name,
		"newName" : new_field_name,
		"isArray" : isArray
	});
	
	return this;
};

/**
 * Return row formatted
 * @param row
 * @returns {___anonymous1639_1640}
 */
ElasticSearchResult.prototype.formatRow = function(row) {
	var newRow={};
	
	/**
	 * Format field row
	 */
	this.formattedFields.forEach(function(format){
		var field_name=format.fieldName;
		
		var label=format.newName;
		var isArray=false;
		if("isArray" in format)
			isArray=format.isArray;
		
		if(field_name in row){
			var field_val=row[field_name];
			if(Array.isArray(field_val) && !isArray)		
				newRow[label]=field_val[0];
			else
				newRow[label]=field_val;
		}
	});
	
	/**
	 * Add constant
	 */
	for(var constantField in this.constantFields){
		var constant=this.constantFields[constantField];
		
		newRow[constantField]=constant;
	}
	
	return newRow;
};

/**
 * Get Result with rename, formatted field and without blacklist
 * @param formattedFields
 * @returns {ElasticSearchResult}
 */
ElasticSearchResult.prototype.getFormattedResult = function() {
	var that=this;

	var formattedResult=[];
	that.result.forEach(function(row){
		if(that.useThisRow(row)){
			var newRow=that.formatRow(row);

			if(Object.keys(newRow).length > 0)
				formattedResult.push(newRow);
		}
	});

	return formattedResult;
};



// export the class
module.exports = ElasticSearchResult;