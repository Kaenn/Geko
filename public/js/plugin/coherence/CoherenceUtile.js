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
	
	this.pluginInput=pluginInput;
	
	this.answer=answer;

	this.answerMultiple=answerMultiple;
}


CoherenceUtile.prototype.getAnswer=function(label){
	if(label==null) return "Aucune incohérence";
	var answer=this.answer;
	answer=answer.replace(/(<\$label\$>)/g,label);
	return answer;
}

CoherenceUtile.prototype.getAnswerMultiple=function(){
	return this.answerMultiple;
}

CoherenceUtile.prototype.getAllResponses=function(callback){
	this.socket.emit("get-input-coherence",this.coherence);
}

CoherenceUtile.prototype.getNext=function(blacklist){
	this.socket.emit("get-next-incoherence",this.coherence, this.outil, this.target,blacklist);
}

CoherenceUtile.prototype.valider=function(id,response,callback){
	this.socket.emit("validate-incoherence",this.coherence, id,response);
	/*var isValidate=false;
	$.ajax({
		dataType: "json",
		method : "POST",
		url: "ajax/validerIncoherence.php",
		data: { coherence: this.coherence, elem : elemId, response: response}
	}).done(function(data){
		callback( ("success" in data) );
	});*/
}


CoherenceUtile.prototype.loadNbIncoherence=function(){
	this.socket.emit("refresh-nb-incoherence",this.coherence, this.outil, this.target);
}

CoherenceUtile.prototype.loadAllIncoherence=function(callback){
	this.socket.emit("get-all-incoherence",this.coherence, this.outil, this.target);
}