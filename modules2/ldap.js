process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var ldap = require('ldapjs');

var connect=function(login,pass,callback){
	var client = ldap.createClient({
		url: config.ldap.url
	});
	
	client.bind(login+'@ops', pass, function(err) {
		callback(err === null);
	});
}
	
exports.connect = connect;