(function($){
	// Parametre par defaut
	var defauts={
		"coherenceClass" : null,
		"autoStart" : true
	};


	$.fn.coherence=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var coherence=$(this).data('coherence');
			if (typeof coherence === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				coherence=$.coherence($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=coherence.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('coherence',coherence);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.coherence=function(that,methodOrOptions){
		that.coherence=null;
		that.element=null;
		that.elementId=null;
		that.inputPlugin=null;
		
		// Regroupe les serveurs passé
		that.blacklist=[];
		
		var initialize = function(){
			
			if(that.parametres.coherenceClass!=null){
				that.coherence=that.parametres.coherenceClass;
				
				if(that.parametres.autoStart)
					printCoherence();
				else
					printStart();
			}
			
			return that;
		};
		
		var addListener=function(){
			that.coherence.socket.removeAllListeners('get-all-incoherence');
			that.coherence.socket.on('get-next-incoherence',function(coherenceName,id,label,input,propositions){
				// On ne prend en compte l'evenement que si on sur cette coherence
				if(coherenceName==that.parametres.coherenceClass.coherence)
					instancierCoherence(id,label,input,propositions)
			});
			
			that.coherence.socket.removeAllListeners('validate-incoherence');
			that.coherence.socket.on('validate-incoherence',function(coherenceName,outil,target){
				// On ne prend en compte l'evenement que si on sur cette coherence
				if(coherenceName==that.parametres.coherenceClass.coherence)
					next();
			});
		}
		
		var printStart=function(){
			that.empty();
			
			that.append(
				$('<div>',{"class":"row"}).append(
			    	$("<button>",{"class":"btn btn-default"}).text("Trouver incoherence").on("click",function(){
			    		printCoherence();
			    	})
				)
			);
			
			return that;
		}
		
		var printCoherence=function(elem){
			that.empty();
			
			addListener();
			
			that._error=$("<div>",{"class" : "alert alert-danger"});
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"});
			that._coherenceForm=$("<div>");
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
			that._end=$("<span>").text("Aucune incoherence.");
			
			initEvent();

			that.append([
			    $('<div>',{"class":"row"}).append(
			    		$('<div>',{"class":"well"}).append([
			    		    that._error,
			    		    that._spinner,
			    		    that._coherenceForm,
			    		    that._end
			    		])
			    ),
			    that._buttons
			]);
			
			loadCoherence();
			
			return that;
		}
		
		var instancierCoherence=function(elemId,elem,input,propositions){
			if(elemId==null){
				setStatus('end');
			}else{
				that.element=elem;
				that.elementId=elemId;
				var coherenceName=that.coherence.coherence;
				var answer=that.coherence.getAnswer(that.element);
				that.inputPlugin=that.coherence.pluginInput;
				// Vider l'ancienne coherence
				that._coherenceForm.empty();

				// On instancie l'inputPlugin
				that._coherenceForm.append($("<div>")[that.inputPlugin]({
					coherence : coherenceName,
					data : input,
					answer : answer,
					propositions : propositions
				}));
				
				setStatus("work");
			}
		}
		
		var loadCoherence=function(){
			setStatus("wait");
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				that.element=null;
				that.elementId=null;
				
				that.coherence.getNext(that.blacklist);
				
			},100);
			
			return that;
		}
		
		var initEvent=function(){
			// Suppression des anciens event
			that._coherenceForm.unbind("print-error");
			
			
			// Ajout des nouveaux event
			that._coherenceForm.on("print-error",function(evt,txt){
				printError(txt);
			});
		}
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._error.hide();
				    			that._spinner.show();
				    			that._coherenceForm.hide();
				    			that._buttons.hide();
				    			that._end.hide();
								break;
				case "work" : 	that._spinner.hide();
				    			that._coherenceForm.show();
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
    		    			that._coherenceForm.hide();
    		    			that._buttons.hide();
    		    			that._end.hide();
							break;
			}
		}
		
		
		var passer = function(){
			setStatus("wait");
			
			// On ne prend plus en compte la coherence en cours
			that.blacklist.push(that.elementId);
			
			
			setTimeout(function(){
				// passage à la prochaine coherence
				next();
			},100);
			
			return that;
		}
		
		var next=function(){
			that.coherence.getNext(that.blacklist);
			
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
				var results=that._coherenceForm.children().first()[that.inputPlugin]("getResult");
				
				if(results.length > 0){
					if(results[0]!=null && results[0]!=""){
						that.coherence.valider(that.elementId,results[0]);
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
				$.error( 'Method ' +  method + ' does not exist on jQuery.coherence' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);