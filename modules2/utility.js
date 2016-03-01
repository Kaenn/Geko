// Ajoute un id en autoincremente sur les lignes du tableau
function addAutoIncrement(liste){
	var i=1;
	liste.forEach(function(row){
		row['id']=i;
		
		i++;
	});
	
	return liste;
}

// renomme un attribut d'un objet
function renameObjectAttr(object,oldName,newName){
	var newObject={};
	for(attr_name in object){
		var object_value=object[attr_name];
		
		if(attr_name==oldName){
			newObject[newName]=object_value;
		}else{
			newObject[attr_name]=object_value;
		}
	}
	
	return newObject;
}

// Renomme les attribut d'une liste d'objet
function renameListeObjectAttribut(liste,oldName,newName){
	var newListe=[];
	liste.forEach(function(object){
		newListe.push(renameObjectAttr(object,oldName,newName));
	});
	
	return newListe;
}



exports.addAutoIncrement = addAutoIncrement;
exports.renameListeObjectAttribut = renameListeObjectAttribut;