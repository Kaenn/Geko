/**
 * @author : Kaenn
 */

var CheckParser=require('./check/CheckParser');

//Constructor
function ResultParser(result) {
  this.result = result;
  this.blacklistFields = {};
  this.whitelistFields = {};
  this.formattedFields = [];
  this.constantFields = {};
  this.checkFields= {};
  this.idField=null;
  this.labelField=null;
  this.resultLimit=null;
}

/**
 * Add blacklist in field
 * @param field_name
 * @param blacklist
 * @returns {ResultParser}
 */
ResultParser.prototype.addBlacklistField = function(field_name,blacklist) {
	this.blacklistFields[field_name]=blacklist;
	
	return this;
};

/**
 * Specify id field
 * @param idField
 * @returns {ResultParser}
 */
ResultParser.prototype.addIdField = function(idField) {
	this.idField=idField;
	this.addFormattedField(this.idField,"id",false);
	
	return this;
};

/**
 * Specify label field
 */
ResultParser.prototype.addLabelField = function(labelField) {
	this.labelField=labelField;
	this.addFormattedField(this.labelField,"label",false);
	
	return this;
};


/**
 * Add blacklist to id field
 * @param blacklist
 * @returns {ResultParser}
 */
ResultParser.prototype.addIdBlacklist = function(blacklist) {
	this.blacklistFields[this.idField]=blacklist;
	
	return this;
};

/**
 * Check if row is in blacklist
 * @param row
 * @returns {Boolean}
 */
ResultParser.prototype.isInBlacklist = function(row) {
	for(var field_name in this.blacklistFields){
		var blacklistOfField=this.blacklistFields[field_name];
		
		var values=row[field_name];
		if(!Array.isArray(values)) values=[values];
		
		var isIn=false;
		values.forEach(function(val){
			if(blacklistOfField.indexOf(val) >= 0) isIn=true;
		});

		if(isIn) return true;
	}
	
	return false;
};

/**
 * Add blacklist in field
 * @param field_name
 * @param blacklist
 * @returns {ResultParser}
 */
ResultParser.prototype.addWhitelistField = function(field_name,whitelist) {
	this.whitelistFields[field_name]=whitelist;
	
	return this;
};

/**
 * Check if row is in blacklist
 * @param row
 * @returns {Boolean}
 */
ResultParser.prototype.isInWhitelist = function(row) {
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
ResultParser.prototype.useThisRow = function(row) {
	if(this.isCheck(row)){
		// If have withlist search if row is in
		if(Object.keys(this.whitelistFields).length > 0){
			return this.isInWhitelist(row);
		// If have blacklist search if row is not in
		}else if(Object.keys(this.blacklistFields).length > 0){
			return !this.isInBlacklist(row);
		}
		
		return true;
	}
	
	return false;
};

/**
 * Verify if check is good for this row
 */
ResultParser.prototype.isCheck = function(row) {
	// If have checkField
	if(Object.keys(this.checkFields).length > 0){
		var cp=new CheckParser(this.checkFields);
		
		return cp.check(row);
	}
	
	return true;
}

/**
 * Add field constant
 * @param field_name
 * @param constant
 * @returns {ResultParser}
 */
ResultParser.prototype.addConstantField = function(field_name,constant) {
	this.constantFields[field_name]=constant;
	
	return this;
};

/**
 * Add a check
 * @param field_name
 * @param check
 * @returns {ResultParser}
 */
ResultParser.prototype.addCheckField = function(field_name,check) {
	this.checkFields[field_name]=check;
	
	return this;
};

/**
 * Set the limit number of result
 * @param limit
 * @returns {ResultParser}
 */
ResultParser.prototype.setLimitResult = function(limit) {
	this.resultLimit=limit;
	
	return this;
};

/**
 * Add format to field
 * @param field_name
 * @param new_field_name
 * @param isArray
 * @returns {ResultParser}
 */
ResultParser.prototype.addFormattedField = function(field_name,new_field_name,isArray) {
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
ResultParser.prototype.formatRow = function(row) {
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
 * @returns {ResultParser}
 */
ResultParser.prototype.getFormattedResult = function() {
	var that=this;

	var formattedResult=[];
	
	that.result.every(function(row){
		if(that.useThisRow(row)){
			var newRow=that.formatRow(row);

			if(Object.keys(newRow).length > 0){
				formattedResult.push(newRow);
				
				// check if limit is not exceed
				if(this.resultLimit!=null && formattedResult.length >= this.resultLimit){
					return false;
				}
			}
		}
		return true;
	});
	return formattedResult;
};



// export the class
module.exports = ResultParser;