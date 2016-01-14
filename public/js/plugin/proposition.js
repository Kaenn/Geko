(function($){
	// Parametre par defaut
	var defauts={
		"propositionClass" : null,
		"autoStart" : true
	};


	$.fn.proposition=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var proposition=$(this).data('proposition');
			if (typeof proposition === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				proposition=$.proposition($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=proposition.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('proposition',proposition);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.proposition=function(that,methodOrOptions){
		that.proposition=null;
		that.element=null;
		that.elementId=null;
		that.inputPlugin=null;
		
		// Regroupe les serveurs passé
		that.blacklist=[];
		
		var initialize = function(){
			
			if(that.parametres.propositionClass!=null){
				that.proposition=that.parametres.propositionClass;
				
				if(that.parametres.autoStart)
					printProposition();
				else
					printStart();
			}
			
			return that;
		};
		
		var addListener=function(){
			that.proposition.socket.removeAllListeners('get-next-proposition');
			that.proposition.socket.on('get-next-proposition',function(propositionName,id,label,input,propositions){
				// On ne prend en compte l'evenement que si on sur cette proposition
				if(propositionName==that.parametres.propositionClass.proposition)
					instancierProposition(id,label,input,propositions)
			});
			
			that.proposition.socket.removeAllListeners('validate-proposition');
			that.proposition.socket.on('validate-proposition',function(propositionName,outil,target){
				// On ne prend en compte l'evenement que si on sur cette proposition
				if(propositionName==that.parametres.propositionClass.proposition)
					next();
			});
		}
		
		var printStart=function(){
			that.empty();
			
			that.append(
				$('<div>',{"class":"row"}).append(
			    	$("<button>",{"class":"btn btn-default"}).text("Trouver proposition").on("click",function(){
			    		printProposition();
			    	})
				)
			);
			
			return that;
		}
		
		var printProposition=function(elem){
			that.empty();
			
			addListener();
			
			that._error=$("<div>",{"class" : "alert alert-danger"});
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"});
			that._propositionForm=$("<div>");
			that._buttons=$('<div>',{"class":"row"}).append([
		    	$('<div>',{"class":"col-lg-2"}).append(
		    		$("<button>",{"class":"btn btn-default"}).text("Passer").on("click",function(){
		    			passer();
		    		})
		    	),
		    	$('<div>',{"class":"col-lg-2"}).append(
		    		$("<button>",{"class":"btn btn-default"}).text("Valider").on("click",function(){
		    			valider();
		    		})		
		    	)
		    ]);
			that._end=$("<span>").text("Aucune proposition.");
			
			initEvent();

			that.append([
			    $('<div>',{"class":"row"}).append(
			    		$('<div>',{"class":"well"}).append([
			    		    that._error,
			    		    that._spinner,
			    		    that._propositionForm,
			    		    that._end
			    		])
			    ),
			    that._buttons
			]);
			
			loadProposition();
			
			return that;
		}
		
		var instancierProposition=function(elemId,elem,input,propositions){
			if(elemId==null){
				setStatus('end');
			}else{
				that.element=elem;
				that.elementId=elemId;
				var propositionName=that.proposition.proposition;
				var answer=that.proposition.getAnswer(that.element);
				that.inputPlugin=that.proposition.pluginInput;
				// Vider l'ancienne proposition
				that._propositionForm.empty();

				// On instancie l'inputPlugin
				that._propositionForm.append($("<div>")[that.inputPlugin]({
					proposition : propositionName,
					data : input,
					answer : answer,
					propositions : propositions
				}));
				
				setStatus("work");
			}
		}
		
		var loadProposition=function(){
			setStatus("wait");
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				that.element=null;
				that.elementId=null;
				
				that.proposition.getNext(that.blacklist);
				
			},100);
			
			return that;
		}
		
		var initEvent=function(){
			// Suppression des anciens event
			that._propositionForm.unbind("print-error");
			
			
			// Ajout des nouveaux event
			that._propositionForm.on("print-error",function(evt,txt){
				printError(txt);
			});
		}
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._error.hide();
				    			that._spinner.show();
				    			that._propositionForm.hide();
				    			that._buttons.hide();
				    			that._end.hide();
								break;
				case "work" : 	that._spinner.hide();
				    			that._propositionForm.show();
				    			that._buttons.show();
				    			that._end.hide();
				    			break;
				case "error" :  that._error.show();
								that._spinner.hide();
								that._buttons.show();
								that._end.hide();
								break;
				case "end" :  	that._error.hide();
								that._spinner.hide();
								that._buttons.hide();
								that._end.show();
								break;
				default : 	that._error.hide();
    		    			that._spinner.hide();
    		    			that._propositionForm.hide();
    		    			that._buttons.hide();
    		    			that._end.hide();
							break;
			}
		}
		
		
		var passer = function(){
			setStatus("wait");
			
			// On ne prend plus en compte la proposition en cours
			that.blacklist.push(that.elementId);
			
			
			setTimeout(function(){
				// passage à la prochaine proposition
				next();
			},100);
			
			return that;
		}
		
		var next=function(){
			that.proposition.getNext(that.blacklist);
			
			return that;
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
		
		
		var valider = function(){
			setStatus("wait");
			
			setTimeout(function(){
				// recupère les resultats
				// C'est un tableau car le plugin marche par groupe , il retourne donc les results du groupe
				var results=that._propositionForm.children().first()[that.inputPlugin]("getResult");
				
				if(results.length > 0){
					if(results[0]!=null && results[0]!=""){
						that.proposition.valider(that.elementId, results[0]);
					}else{
						printError("Vous devez choisir une réponse.");	
						setStatus("work");
					}
				}else{
					printError("Problème de plugin!");	
					setStatus("work");
				}
				that.trigger('refresh');
			},100);
			
			return that;
		}
		
		
		var methods={};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.proposition' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);