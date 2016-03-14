var request = require("request");
var Q = require('q');

var params={
	"refreshTimer" : 9000
}


function getParams(name){
	if(name in params){
		return params[name];
	}
	return null;
}

/**
 * Ajoute à la data la concatenation d'ip et du subnet mask
 * @param data
 * @returns
 */
function addIPWithMask(data){
	var i=0;
	data.forEach(function(d){
		if("subnet_baseaddr" in d && "subnet_mask" in d)
			d['ip_with_mask']=d['ipaddr']+"_"+d['subnet_mask'];
		
		d['id']=i;
		i++;
	});
	
	return data;
}

function getDataFromSource(){
	var deferred = Q.defer();
	
	request({
		followAllRedirects: true,
		url: 'http://gin-claratact-qualif-front1.adm.fr.clara.net/REST/v1/ipplan/ip/get.php'
	}, function (error, response, data) {
		if(!error && response.statusCode=="200"){
			deferred.resolve(addIPWithMask(JSON.parse(data)));
		}else if( error ){
			deferred.reject(error);
		}else{
			deferred.reject("Mauvais statut code pour la requete (Status : "+response.statusCode+")");
		}
	});
	
	return deferred.promise;
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;