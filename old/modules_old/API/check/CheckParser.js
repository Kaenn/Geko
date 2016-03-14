/**
 * @author : Kaenn
 */

var gt=require("./gt");

var allCheck={
	"gt" : gt
}

//Constructor
function CheckParser(checks) {
	this.checks=checks;
}

/**
 * Parse the result
 * @param result
 * @returns {CheckParser}
 */
CheckParser.prototype.checkField = function(field_name,field_value) {
	if(field_name in this.checks){
		var checks=this.checks[field_name];
		
		var check_type=checks['type'];
		var value=field_value;
		
		if(check_type=="length") value=value.length;
		var check_descs=checks['check'];
		for(var check_method in check_descs){
			var check_desc=check_descs[check_method];
			if(check_method in allCheck){
				return allCheck[check_method].check(value,check_desc);
			}else{
				console.log("Check unknown. [name : "+check_type+"]");
			}
		}
	}
	
	return true;
};

CheckParser.prototype.check = function(row) {
	for(var field_name in row){
		var field_value=row[field_name];
		if(!this.checkField(field_name,field_value)) return false;
	}
	return true;
};





// export the class
module.exports = CheckParser;