var SSH = require("simple-ssh");
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


// Recuperation de la clé ssh
var fs = require('fs');
var privateKey="";
if(config.ssh_key_file!=null && config.ssh_key_file!=""){
	if (fs.existsSync(config.ssh_key_file)) {
		privateKey = fs.readFileSync(config.ssh_key_file);
	}
}

/**
 * Ajout des chamsp personnalisé sur la data
 * @param data
 * @returns {___anonymous470_473}
 */
function addFieldToData(data){
	var i=0;
	data.forEach(function(d){
		if("ip" in d){
			d["ip"].forEach(function(ip_desc){
				if("ipAdEntAddr" in ip_desc && "ipAdEntNetMask" in ip_desc){
					ip_desc['ip_with_mask']=ip_desc["ipAdEntAddr"]+"_"+ip_desc['ipAdEntNetMask'];
				}
			});
		}
		
		d['id']=i;
		i++;
	});
	
	return data;
}

function getDataFromSource(){
	var promises=[
	    getDataProxy1(),
	    getDataProxy2(),
    ];
	return Q.all(promises).then(function(allData){
		var data=[];
		allData.forEach(function(d){
			data=data.concat(d);
		});
		
		return data;
	})
	.then(addFieldToData);
}
/*
function getDataProxy1(){
	var deferred = Q.defer();
	
	var ssh = new SSH({
		"host" : '10.2.31.12',
		"user" : 'manage_script',
		"key" : privateKey
	});
	
	ssh.on("error",function(err){
		console.log(err);
	});

	ssh.exec('php /data/manage_scripts/check_ip/extract_ip.php 2>>/data/manage_scripts/check_ip/extract_ip.log', {
	    out: function(data) {
	    	deferred.resolve(JSON.parse(data));
	    }
	}).start();
	
	return deferred.promise;
}

function getDataProxy2(){
	var deferred = Q.defer();
    
	var ssh = new SSH({
		"host" : '10.2.31.13',
		"user" : 'manage_script',
		"key" : privateKey
	});
	
	ssh.on("error",function(err){
		console.log(err);
	});

	ssh.exec('php /data/manage_scripts/check_ip/extract_ip.php 2>>/data/manage_scripts/check_ip/extract_ip.log', {
	    out: function(data) {
	    	deferred.resolve(JSON.parse(data));
	    }
	}).start();
	
	return deferred.promise;
}*/


function getDataProxy1(){
	//var data=[  {    "sysName":"fb-fw1-finatech",    "ip":[      {        "ipAdEntAddr":"10.0.0.1",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },      {        "ipAdEntAddr":"10.0.0.16",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },      {        "ipAdEntAddr":"10.0.19.86",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"fxp0.0",        "ifPhysAddress":"40:a6:77:33:bc:c6",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"30.33.0.200",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"fab0.0",        "ifPhysAddress":"40:a6:77:33:bd:30",        "ifType":"ieee8023adLag(161)"      },      {        "ipAdEntAddr":"30.34.0.200",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"fab1.0",        "ifPhysAddress":"40:a6:77:33:d6:f0",        "ifType":"ieee8023adLag(161)"      },      {        "ipAdEntAddr":"128.0.0.1",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },      {        "ipAdEntAddr":"128.0.0.4",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },      {        "ipAdEntAddr":"128.0.1.16",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },      {        "ipAdEntAddr":"129.32.0.1",        "ipAdEntNetMask":"192.0.0.0",        "ifDescr":"fxp1.0",        "ifPhysAddress":"40:a6:77:33:bc:c7",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"212.43.199.228",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"reth1.912",        "ifPhysAddress":"0:10:db:ff:21:1",        "ifType":"ieee8023adLag(161)"      },      {        "ipAdEntAddr":"212.43.199.229",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"reth1.912",        "ifPhysAddress":"0:10:db:ff:21:1",        "ifType":"ieee8023adLag(161)"      },      {        "ipAdEntAddr":"212.43.216.30",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"reth0.540",        "ifPhysAddress":"0:10:db:ff:21:0",        "ifType":"ieee8023adLag(161)"      }    ]  },  {    "sysName":"fb-fw2-finatech",    "ip":[      {        "ipAdEntAddr":"10.0.19.87",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"fxp0.0",        "ifPhysAddress":"40:a6:77:33:d6:86",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"130.32.0.1",        "ipAdEntNetMask":"192.0.0.0",        "ifDescr":"fxp1.0",        "ifPhysAddress":"40:a6:77:33:d6:87",        "ifType":"propVirtual(53)"      }    ]  },  {    "sysName":"vox-vf-ppd",    "ip":[      {        "ipAdEntAddr":"10.129.0.180",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth1",        "ifPhysAddress":"18:3:73:b:4d:cf",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.45.138",        "ipAdEntNetMask":"255.255.255.224",        "ifDescr":"eth0.431",        "ifPhysAddress":"18:3:73:b:4d:cd",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.10",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth0",        "ifPhysAddress":"18:3:73:b:4d:cd",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.170.101.10",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"0:10:18:a2:a4:cc",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.170.101.11",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"0:10:18:a2:a4:cc",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.170.101.12",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"0:10:18:a2:a4:cc",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"vox-vf-ppdb1",    "ip":[      {        "ipAdEntAddr":"10.129.0.183",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth4",        "ifPhysAddress":"18:3:73:ef:6b:80",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.11",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:7c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.14",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:7c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.15",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:7c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.16",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:7c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"172.16.20.161",        "ipAdEntNetMask":"255.255.255.240",        "ifDescr":"bond0",        "ifPhysAddress":"0:1b:21:ba:ae:c",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"vox-vf-ppdb2",    "ip":[      {        "ipAdEntAddr":"10.129.0.184",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth4",        "ifPhysAddress":"18:3:73:ef:6b:5c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.12",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:58",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.13",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:58",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.129.101.17",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"18:3:73:ef:6b:58",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"172.16.20.162",        "ipAdEntNetMask":"255.255.255.240",        "ifDescr":"bond0",        "ifPhysAddress":"0:1b:21:ba:75:bd",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"yunadm-pa01",    "ip":[      {        "ipAdEntAddr":"10.129.104.11",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:a3:3f:5b",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.229.1.43",        "ipAdEntNetMask":"255.255.224.0",        "ifDescr":"eth1",        "ifPhysAddress":"0:50:56:a3:3f:5c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"89.185.61.54",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth2",        "ifPhysAddress":"0:50:56:a3:3f:65",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"yunmql-pd01",    "ip":[      {        "ipAdEntAddr":"10.129.104.12",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:a3:3f:5d",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.229.1.44",        "ipAdEntNetMask":"255.255.224.0",        "ifDescr":"eth1",        "ifPhysAddress":"0:50:56:a3:3f:5e",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"yuncrm-pa01",    "ip":[      {        "ipAdEntAddr":"10.129.104.13",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:a3:f:a0",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.229.1.58",        "ipAdEntNetMask":"255.255.224.0",        "ifDescr":"eth1",        "ifPhysAddress":"0:50:56:a3:f:a1",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"yunccl-pn01",    "ip":[      {        "ipAdEntAddr":"10.129.104.14",        "ipAdEntNetMask":"255.255.254.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:a3:f:9e",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.229.1.59",        "ipAdEntNetMask":"255.255.224.0",        "ifDescr":"eth1",        "ifPhysAddress":"0:50:56:a3:f:9f",        "ifType":"ethernetCsmacd(6)"      }    ]  }];
	var data=[  
	    {    
	    	"sysName":"fb-fw1-finatech",    
	    	"ip":[      
	    	      {        "ipAdEntAddr":"10.0.0.1",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      }
	        ]
		},
		{    
	    	"sysName":"host2",    
	    	"ip":[      
	    	      {        "ipAdEntAddr":"10.6.3.214",        "ipAdEntNetMask":"255.255.252.0",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      }
	        ]
		},
		{    
	    	"sysName":"host3",    
	    	"ip":[      
	    	      {        "ipAdEntAddr":"10.2.4.87",        "ipAdEntNetMask":"255.255.225.0",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      },
	    	      {        "ipAdEntAddr":"10.2.4.88",        "ipAdEntNetMask":"255.255.225.0",        "ifDescr":"lo0.16385",        "ifPhysAddress":"",        "ifType":"softwareLoopback(24)"      }
	        ]
		}
	];
	
	return Q.fcall(function () {
	    return data;
	});
}

function getDataProxy2(){
	//var data=[  {    "sysName":"ch-fw1",    "ip":[      {        "ipAdEntAddr":"10.0.1.4",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/0",        "ifPhysAddress":"ac:4b:c8:72:2f:0",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.1.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/8",        "ifPhysAddress":"0:10:db:fc:10:c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.2.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/6",        "ifPhysAddress":"0:10:db:fc:10:a",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.8.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/9",        "ifPhysAddress":"0:10:db:fc:10:d",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.1.130.2",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"tunnel.2",        "ifPhysAddress":"0:0:0:0:0:0",        "ifType":"tunnel(131)"      },      {        "ipAdEntAddr":"62.240.254.57",        "ipAdEntNetMask":"255.255.255.248",        "ifDescr":"ethernet0\/4",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"88.164.160.154",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"free",        "ifPhysAddress":"0:10:db:fc:10:5",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"169.254.0.1",        "ipAdEntNetMask":"255.255.255.252",        "ifDescr":"ethernet0\/4.2",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"172.16.90.97",        "ipAdEntNetMask":"255.255.255.248",        "ifDescr":"ethernet0\/4.1",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"192.168.100.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/7",        "ifPhysAddress":"0:10:db:fc:10:b",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"213.56.183.221",        "ipAdEntNetMask":"255.255.255.252",        "ifDescr":"ethernet0\/2",        "ifPhysAddress":"0:10:db:fc:10:6",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"ch-ond1-b01",    "ip":[      {        "ipAdEntAddr":"10.0.1.101",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"",        "ifPhysAddress":"f0:f0:f0:f0:f0:f4:30:f0:f0:d0:f0:d0:f0:f0:f0:f0:f0:f0:f0:f0:f0:70:30:f0:f0:d0:f1:f0:f0:f0:b8:f0:f0:f8:f8:f0:f0:f0:f0:f0:f0:f2:f0:f0:f0:f8:f0:f0:f0:f0:f0:f1:f0:f0:78:f0:f0:e0:f0:f0:f0:f0:b0:f0:f0:f0:f0:f0:f0:b0:f8:f0:f0:f1:f0:f0:f0:f0:f0:70:f0:f1:f0:f0:f0:f0:70:b0:f0:d0:e0:f0:f0:f0:f8:f0:f0:f1:f0:f1:d0:f0:b4:f0:f0:f0:f0:f0:f0:70:b4:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:d1:f0:f0:f4:f0:f0:f0:f0:f0:f0:f0:70:f0:f0:f0:f2:f0:e0:f0:f4:f0:f0:f0:f2:d0:f0:f0:f0:f4:f0:f0:f2:f1:f0:f2:70:f4:f0:f0:f0:f1:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0:d0:d0:f0:f0:f0:f0:f0:f0:f0:f0:f0:d0:f0:74:f0:f0:f0:e0:f0:f0:f4:f0:f0:70:f0:f0:f0:f0:f0:f0:f0:f0:d1:e0:f0:f0:f0:b0:f0:f0:d3:f1:f0:f0:f0:f4:f0:f0:f0:f1:f0:f0:70:f0:f0:f0:f0:f0:f0:f0:f0:f0:f0",        "ifType":"other(1)"      }    ]  },  {    "sysName":"linux-rennes-01",    "ip":[      {        "ipAdEntAddr":"10.0.1.13",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:8f:5a:a4",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"ch-fw2",    "ip":[      {        "ipAdEntAddr":"10.0.1.2",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/8",        "ifPhysAddress":"0:10:db:fc:10:c",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.1.5",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/0",        "ifPhysAddress":"ac:4b:c8:72:31:80",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.2.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/6",        "ifPhysAddress":"0:10:db:fc:10:a",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.0.8.2",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/9",        "ifPhysAddress":"0:10:db:fc:10:d",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"10.1.130.2",        "ipAdEntNetMask":"255.255.255.255",        "ifDescr":"tunnel.2",        "ifPhysAddress":"0:0:0:0:0:0",        "ifType":"tunnel(131)"      },      {        "ipAdEntAddr":"62.240.254.57",        "ipAdEntNetMask":"255.255.255.248",        "ifDescr":"ethernet0\/4",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"88.164.160.154",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"free",        "ifPhysAddress":"0:10:db:fc:10:5",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"169.254.0.1",        "ipAdEntNetMask":"255.255.255.252",        "ifDescr":"ethernet0\/4.2",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"172.16.90.97",        "ipAdEntNetMask":"255.255.255.248",        "ifDescr":"ethernet0\/4.1",        "ifPhysAddress":"0:10:db:fc:10:8",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"192.168.100.254",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"ethernet0\/7",        "ifPhysAddress":"0:10:db:fc:10:b",        "ifType":"ethernetCsmacd(6)"      },      {        "ipAdEntAddr":"213.56.183.221",        "ipAdEntNetMask":"255.255.255.252",        "ifDescr":"ethernet0\/2",        "ifPhysAddress":"0:10:db:fc:10:6",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"cladoc-pw01-bkp",    "ip":[      {        "ipAdEntAddr":"10.0.1.23",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"eth0",        "ifPhysAddress":"0:50:56:a3:8:ed",        "ifType":"ethernetCsmacd(6)"      }    ]  },  {    "sysName":"ch-sw2-cam.adm.fr.clara.net",    "ip":[      {        "ipAdEntAddr":"10.0.1.243",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"Vlan10",        "ifPhysAddress":"b4:e9:b0:c1:82:c1",        "ifType":"propVirtual(53)"      }    ]  },  {    "sysName":"ch-sw1-b01.adm.fr.clara.net",    "ip":[      {        "ipAdEntAddr":"10.0.1.253",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"Vlan10",        "ifPhysAddress":"0:17:e0:98:22:ff",        "ifType":"propVirtual(53)"      },      {        "ipAdEntAddr":"10.0.8.4",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"Vlan80",        "ifPhysAddress":"0:17:e0:98:22:ff",        "ifType":"propVirtual(53)"      }    ]  },  {    "sysName":"claavr-pv03.claranet.local",    "ip":[      {        "ipAdEntAddr":"10.0.1.26",        "ipAdEntNetMask":"255.255.255.0",        "ifDescr":"vmxnet3 Ethernet Adapter #2",        "ifPhysAddress":"0:50:56:a3:f:d8",        "ifType":"ethernetCsmacd(6)"      }    ]  }];
	var data=[];
	
	return Q.fcall(function () {
	    return data;
	});
}

// Params
exports.getParams = getParams;

// Fonctions
exports.getDataFromSource = getDataFromSource;