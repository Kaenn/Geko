(function($){
	// Parametre par defaut
	var defauts={
		"coherenceClass" : null
	};


	$.fn.modalResolutions=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var modalResolutions=$(this).data('modalResolutions');
			if (typeof modalResolutions === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				modalResolutions=$.modalResolutions($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=modalResolutions.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('modalResolutions',modalResolutions);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.modalResolutions=function(that,methodOrOptions){
		that.coherence=null;
		
		var initialize = function(){
			that.empty();
			
			if(that.parametres.coherenceClass!=null){
				that.coherence=that.parametres.coherenceClass;
			}
			
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"}).hide();
			that._body=$("<div>");
			that._error=$("<div>",{"class" : "alert alert-danger"});
			
			that.addClass("modal fade");
			that.attr('tabindex',"-1");
			that.attr("role","dialog");
			
			that.append([
			    $("<div>",{"class":"modal-dialog","role":"document"}).append([
            		$("<div>",{"class":"modal-content"}).append([
            			$("<div>",{"class":"modal-header"}).append([
            				$("<button>",{"type":"button","class":"close","data-dismiss":"modal","aria-label":"Close"}).append([
            					$("<span>",{"aria-hidden":"true"}).html("&times;")
            				]),
            				$("<h4>",{"class":"modal-title","id":"modalValidationIncoherenceLabel"}).text("Résolutions multiple")
            			]),
            			$("<div>",{"class":"modal-body"}).append([
            			    that._spinner,
            			    that._error,
            			    that._body
            			]),
            			$("<div>",{"class":"modal-footer"}).append([
            				$("<button>",{"type":"button","class":"btn btn-default","data-dismiss":"modal"}).text("Fermer"),
            				$("<button>",{"type":"button","class":"btn btn-primary"}).text("Valider").on("click",function(){
            					valider()
            				})
            			])
            		])
            	])
            ]);
			
			hide();
			
			return that;
		};
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._spinner.show();
								that._error.hide();
								that._body.hide();
								break;
				case "work" : 	that._spinner.hide();
								that._body.show();
				    			break;
				case "error" :  that._error.show();
								that._spinner.hide();
								that._body.show();
								break;
				default : 	that._spinner.hide();
							that._body.show();
    		    			break;
			}
		}
		
		var wait=function(){
			setStatus("wait");
			
			return that;
		}
		
		var work=function(){
			setStatus("work");
			
			return that;
		}
		
		var printError=function(txt){
			that._error.text(txt);
			setStatus("error");
			
			return that;
		}
		
		var loadBody=function(){
			wait();
			
			that._body.empty();
			
			var coherenceName=that.coherence.coherence;
			that.coherence.getAllResponses(function(responses){
				var answer=that.coherence.getAnswerMultiple();
				that._inputPlugin=$("<div>");
				
				that._body.append(
					that._inputPlugin
				);
				
				that._inputPlugin[that.coherence.pluginInput]({
					coherence : coherenceName,
					data : responses,
					answer : answer
				});
				
				work();
			});
		}
		
		
		var valider=function(){
			var reponses=that._inputPlugin[that.coherence.pluginInput]("getResult");
			
			var haveGoodReponse=false;

			if(reponses.length > 0){
				hide();
				
				$.each(reponses,function(index,reponse){
					if(reponse!==null && reponse !==""){
						haveGoodReponse=true;
					}
				});
			}	
		
		
			if(!haveGoodReponse){
				printError("Vous devez choisir une valeur.");
			}else{
				that.trigger("valider",reponses);
			}
		}
		
		
		var show=function(){
			that.modal('show');
			loadBody();
		}
		
		
		var hide=function(){
			that.modal('hide');
			loadBody();
		}
		
		var methods={
			"show" : function(){ return show(); },
			"hide" : function(){ return hide(); }
		};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.modalResolutions' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);