/**
 * Création de la classe PropositionUtile
 */
function PropositionUtile(socket,coherence,outil,target,inputName,answer,pluginInput){
	this.socket=socket;
	this.coherence=coherence;
	this.input=inputName;
	
	// Permet de cibler la liste en entrée de la proposition
	this.outil=outil;
	this.target=target;
	
	this.pluginInput=pluginInput;
	
	this.answer=answer;

	this.answerMultiple=answerMultiple;
}


PropositionUtile.prototype.getAnswer=function(label){
	if(label==null) return "Aucune proposition";
	var answer=this.answer;
	answer=answer.replace(/(<\$label\$>)/g,label);
	return answer;
}

PropositionUtile.prototype.getAnswerMultiple=function(){
	return this.answerMultiple;
}

PropositionUtile.prototype.getAllResponses=function(){
	this.socket.emit("get-input-coherence",this.coherence);
}

PropositionUtile.prototype.getNext=function(blacklist){
	this.socket.emit("get-next-incoherence",this.coherence, this.outil, this.target,blacklist);
}

PropositionUtile.prototype.valider=function(id,responses){
	this.socket.emit("validate-incoherence", this.coherence, this.outil, this.target, id, responses);
}

PropositionUtile.prototype.validerMulti=function(responses){
	this.socket.emit("validate-multiple-incoherence", this.coherence, this.outil, this.target, responses);
}

PropositionUtile.prototype.loadNbIncoherence=function(){
	this.socket.emit("refresh-nb-incoherence",this.coherence, this.outil, this.target);
}

PropositionUtile.prototype.loadAllIncoherence=function(){
	this.socket.emit("get-all-incoherence",this.coherence, this.outil, this.target);
}