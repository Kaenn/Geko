/**
 * Création de la classe CoherenceUtile
 */
function CoherenceUtile(socket,coherence,outil,target,inputName,answer,answerMultiple,pluginInput){
	this.socket=socket;
	this.coherence=coherence;
	this.input=inputName;
	
	// Permet de cibler la liste en entrée de l'incoherence
	this.outil=outil;
	this.target=target;
	
	this.element=null;
	this.elementId=null;
	
	this.pluginInput=pluginInput;
	
	this.answer=answer;

	this.answerMultiple=answerMultiple;
}


CoherenceUtile.prototype.getAnswer=function(){
	if(this.element==null) return "Aucune incohérence";
	var answer=this.answer;
	answer=answer.replace(/({{element}})/g,this.element);
	return answer;
}

CoherenceUtile.prototype.getAnswerMultiple=function(){
	return this.answerMultiple;
}

CoherenceUtile.prototype.getAllResponses=function(callback){
	$.ajax({
		url : "ajax/getInput.ajax.php?coherence="+this.coherence+"&input="+this.input+"&elem="+this.elementId,
		dataType : "json"
	}).done(function(data) {
		callback(data);
	});
}

CoherenceUtile.prototype.getNext=function(blacklist,callback){
	var that=this;
	$.ajax({
		dataType: "json",
		url: "ajax/getIncoherence.php",
		data: {coherence : this.coherence,blacklist : blacklist,outil : this.outil, target  :this.target}
	}).done(function(data){
		if("success" in data){
			if(data.success==null){
				callback(null,null,null);
			}else if("elem" in data.success){
				var proposition="";
				if("proposition" in data.success) proposition=data.success.proposition;
				
				that.element=data.success.elem;
				that.elementId=data.success.elemId;
				
				callback(that.element,that.elementId,proposition);
			}
		}
	});
}

CoherenceUtile.prototype.valider=function(elemId,response,callback){
	var isValidate=false;
	$.ajax({
		dataType: "json",
		method : "POST",
		url: "ajax/validerIncoherence.php",
		data: { coherence: this.coherence, elem : elemId, response: response}
	}).done(function(data){
		callback( ("success" in data) );
	});
}


CoherenceUtile.prototype.loadNbIncoherence=function(){
	this.socket.emit("refresh-nb-incoherence",this.coherence, this.outil, this.target);
}

CoherenceUtile.prototype.loadAllIncoherence=function(callback){
	this.socket.emit("get-all-incoherence",this.coherence, this.outil, this.target);
}