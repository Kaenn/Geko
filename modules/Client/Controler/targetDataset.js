function targetDataset(dataset){
	this.dataset=dataset;
}

var methodStatic = targetDataset;


targetDataset.prototype.getDataOfId=function(id){
	if("id" in this.dataset && id in this.dataset.id)
		return this.dataset.id[id];
	
	return [];
}

targetDataset.prototype.getDataOfLabel=function(label){
	if("label" in this.dataset && label in this.dataset.label)
		return this.dataset.label[label];
	
	return [];
}

targetDataset.prototype.getDataOfAll=function(){
	if("all" in this.dataset)
		return this.dataset.all;
	
	return [];
}

targetDataset.prototype.getDataOfElem=function(id,label){
	var data=[];

	data=data.concat(this.getDataOfId(id));
	data=data.concat(this.getDataOfLabel(label));
	data=data.concat(this.getDataOfAll());
	
	return data;
}

targetDataset.prototype.getDataOfElems=function(elems){
	var that=this;
	
	var retour={};
	if(elems.length > 0){
		elems.forEach(function(elem){
			if("id" in elem && "label" in elem){
				retour[elem.id]=that.getDataOfElem(elem.id,elem.label);
			}
		});
	}
	
	return retour;
}

/**
 * Sort dataset by target
 */
targetDataset.sortDataByTarget=function(dataset){
	var retour={
		"all" : [],
		"id" : {},
		"label" : {}
	};
	
	// Rangement des resultats en fonction de leur target
	dataset.forEach(function(data){
		if("target.all" in data){
			retour['all'].push({
				"id" : data['response_id'],
				"label" : data['response_label']
			});
		}
		
		if("target.id" in data){
			var id=data['target.id'];
			if(! (id in retour['id'])) retour['id'][id]=[];
			
			retour['id'][id].push({
				"id" : data['response_id'],
				"label" : data['response_label']
			});
		}
		
		if("target.label" in data){
			var label=data['target.label'];
			if(! (label in retour['label'])) retour['label'][label]=[];
			
			retour['label'][label].push({
				"id" : data['response_id'],
				"label" : data['response_label']
			});
		}
	});
	
	return retour;
}

module.exports = targetDataset;