/**
 * @author : Kaenn
 */


/**
 * Get result from elasticsearch search field
 * @param body
 * @returns
 */
var getListOfFields = function(body) {
	// initialize result
	var result=[];
	// search the fils of body search of elasticsearch
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				result.push(hit['fields']);
			}
		});
	}

	return result;
};

var getListOfOneField = function(body,field_name) {

	// initialize result
	var result=[];
	// search the fils of body search of elasticsearch
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				var fields=hit['fields'];
				
				if(field_name in fields){
					result=result.concat(fields[field_name]);
				}
			}
		});
	}

	return result;
};

/**
 * Get result from elasticsearch search field
 * @param body
 * @returns {ElasticSearchResult}
 */
var loadFromBodyFields = function(body) {
	// initialize result
	var result=[];
	// search the fils of body search of elasticsearch
	if(body.hits.hits.length > 0){
		body.hits.hits.forEach(function(hit){
			if("fields" in hit){
				var fields=hit['fields'];

				var newRow={};
				for (var field_name in fields) {
					var field_value=fields[field_name];

					if(Array.isArray(field_value))		
						newRow[field_name]=field_value[0];
					else
						newRow[field_name]=field_value;
				}

				result.push(newRow);
			}
		});
	}

	return result;
};



/**
 * Function export
 */
exports.getListOfFields = getListOfFields;
exports.getListOfOneField = getListOfOneField;
exports.loadFromBodyFields = loadFromBodyFields;