/**
 * @author : Kaenn
 */
var Q = require('q');
var clientElasticsearch = require('../../Elasticsearch/elasticsearchClient');

/**
 * Launch scheduler with update_function
 * @param index
 * @param type
 * @param timer
 * @param update_function
 * @returns
 */
function addSchedulerData(index,type,timer,update_function){
	setInterval(function(){
		update_function().then(function(data){
			updateDataToES(index,type,data);
		})
		.catch(console.log);
	},timer);
}


/**
 * Update and delete unused data of index elasticsearch
 */
function updateDataToES(index,type,data){
	var bodyBulk=[];
	
	var allIds=[];
	
	var i=1;
	// on ajoute les update dans le bodyBulk
	data.forEach(function(d){
		// Si la data n'a pas d'id alors on autoincremente
		if(!("id" in d)){
			d.id=i;
			i++;
		}	
		var id=d.id;
		
		// on sauvegarde toutes les id pour supprimer les id qui n'existe plus
		allIds.push(id);
		bodyBulk.push({ index: { _index: index, _type: type, _id: id } });
		bodyBulk.push(d);
	});

	var body={
		"fields" : ["_id"]
	};
	
	// On supprime tous les element qui ne sont pas inserer/modifier
	if(allIds.length > 0){
		body.filter={
			"not" : {
            	"terms" : { "_id" : allIds}
			}
        };
	// Si il n'y a pas d'insertion/modification alors on supprime tous
	}else{
		body.query={
			"match_all":{}
		}
	}
	
	// on recherche les elements qui ne doivent plus etre présent
	clientElasticsearch.search({
		index: index,
		type: type,
		body: body
	}).then(function (body) {
		if("hits" in body && "hits" in body['hits']){
			var hits=body['hits']['hits'];

			// on ajoute les delete au bodyBulk
			hits.forEach(function(hit){
				if("_index" in hit && "_type" in hit && "_id" in hit){
					bodyBulk.push({ "delete": { _index: hit._index, _type: hit._type, _id: hit._id } });
				}
			});
		}
	},function(){/* Empty function in case of new index Exception*/}).then(function(){
		if(bodyBulk.length > 0){
			// On lance le groupement d'action (update+delete)
			return clientElasticsearch.bulk({
				body: bodyBulk
			}).then(function (body) {
				var nbUpdate=0;
				var nbDelete=0;
				if("items" in body){
					body['items'].forEach(function(item){
						if("index" in item) nbUpdate++;
						if("delete" in item) nbDelete++;
					});
				}
				console.log("L'index "+index+" / "+type+" a été mis à jour. (Update : "+nbUpdate+", Delete : "+nbDelete+")");
			});
		}else{
			console.log("L'index "+index+" / "+type+" a été mis à jour. (Update : 0, Delete : 0)");
		}
	})
	.catch(console.log);
}


exports.addSchedulerData = addSchedulerData;