var fs = require("fs");
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



function getDataFromSource(){
	var deferred = Q.defer();
    
	var data=[
	      	{"id":"1036626","claratact_id":"1036626","hostname":"gdfsmn-pa01-bat","type":"AWS - EC2","project_id":"4010","project_name":"Ecometering PROD","client_id":"3323","client_name":"ECOMETERING","mappings":{"glpi":[{"id":"11523","type":"H","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=11523"},{"id":"10276","type":"H","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=10276"}],"zabbix":[],"zabbix_cloud":[],"ipplan":{"IPA":[],"IP":[]}}},
	    	{"id":"1036594","claratact_id":"1036594","hostname":"monara-pa20","type":"AWS - EC2","project_id":"3580","project_name":"ARAMIS PRODUCTION","client_id":"3175","client_name":"Monoprix","mappings":{"glpi":[{"id":"9517","type":"H","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=9517"}],"zabbix":[],"zabbix_cloud":[],"ipplan":{"IPA":[],"IP":[]}}},
	    	
	    	{"id":"642128","claratact_id":"642128","hostname":"ats-esxi-01","type":null,"project_id":"2107","project_name":"ATS","client_id":"2438","client_name":"Airbus","mappings":{"glpi":[{"id":"11523","type":"N","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=11523"}],"zabbix":[],"zabbix_cloud":[],"ipplan":{"IPA":[],"IP":[]}}},
	    	
	    	{"id":"1036523","claratact_id":"1036523","hostname":"negatifplus","type":"serveur","project_id":"4186","project_name":"Negatif +","client_id":"3413","client_name":"NEGATIF + ","mappings":{"glpi":[],"zabbix":[],"zabbix_cloud":[],"ipplan":{"IPA":[],"IP":[]}}},
	    	
	    	{"id":"1030774","claratact_id":"1030774","hostname":"sd-cs1-g12","type":"reseau","project_id":0,"project_name":null,"client_id":0,"client_name":"","mappings":{"glpi":[{"id":"810","type":"N","url":null}],"zabbix":[{"id":"100100000004258","type":"H","url":"https:\/\/sys-zabbix-preprod-test.adm.fr.clara.net\/hosts.php?form=update&hostid=100100000004258"}],"zabbix_cloud":[],"ipplan":{"IPA":[{"id":"10.6.0.5_51","type":"IPA"}],"IP":[]}}},
	    	
	    	{"id":"1030777","claratact_id":"1030777","hostname":"rep-ap3","type":"null","project_id":"3791","project_name":"GCS PC - INFOGERANCE","client_id":"3266","client_name":"GCS POITOU CHARENTES","mappings":{"glpi":[],"zabbix":[{"id":"100100000004261","type":"H","url":"https:\/\/sys-zabbix-preprod-test.adm.fr.clara.net\/hosts.php?form=update&hostid=100100000004261"},{"id":"100100000005747","type":"H","url":"https:\/\/sys-zabbix-preprod-test.adm.fr.clara.net\/hosts.php?form=update&hostid=100100000005747"}],"zabbix_cloud":[],"ipplan":{"IPA":[{"id":"10.0.24.250_1980","type":"IPA"}],"IP":[]}}},
	    	
	    	{"id":"1036619","claratact_id":"1036619","hostname":"gdfsmn-rw01-ws","type":"AWS - EC2","project_id":"4009","project_name":"Ecometering PREPROD","client_id":"3323","client_name":"ECOMETERING","mappings":{"glpi":[{"id":"11126","type":"H","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=11126"},{"id":"10252","type":"H","url":"https:\/\/glpi-preprod.adm.fr.clara.net\/front\/computer.form.php?id=10252"}],"zabbix":[],"zabbix_cloud":[],"ipplan":{"IPA":[],"IP":[]}}}
	    ];
	
	return Q.fcall(function () {
	    return data;
	});
}


// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;