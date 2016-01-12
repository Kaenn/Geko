(function($){	
	// Parametre par defaut
	var defauts={
		"coherenceClass" : null
	};


	$.fn.coherenceResolutions=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var coherenceResolutions=$(this).data('coherenceResolutions');
			if (typeof coherenceResolutions === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				coherenceResolutions=$.coherenceResolutions($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=coherenceResolutions.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('coherenceResolutions',coherenceResolutions);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.coherenceResolutions=function(that,methodOrOptions){
		that.coherence=null;
		that.responses=null;
		
		that.coherenceCheck=[];
		
		var initialize = function(){
			that.empty();
			
			if(that.parametres.coherenceClass!=null){
				that.coherence=that.parametres.coherenceClass;
			}
			
			addListener();
			
			that.addClass("listIncoherence");
			
			that._error=$("<div>",{"class" : "alert alert-danger"});
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"}).hide();
			that._listeResolutions=$("<div>");
			
			that._button=$("<div>",{"style":"padding : 25px;"}).append(
				$("<button>",{'type':"button", 'class':"btn btn-default"})
					.text("Valider les propositions selectionné")
				    .on("click",function(){
				    	showModalValidation();
				    })
			);
			
			that._modalValidation=$("<div>").modalResolutions({"coherenceClass" : that.coherence});

			that._modalValidation.on('valider',function(evt,reponses){
				valider(reponses);
			});
			
			that.append([
			    that._error,
			    that._spinner,
			    that._button,
			    that._listeResolutions,
			    that._modalValidation
			]);
			
			loadListePropositions();
			
			return that;
		};
		
		var addListener=function(){
			that.parametres.coherenceClass.socket.removeAllListeners('get-all-incoherence-resolutions');
			that.parametres.coherenceClass.socket.on('get-all-incoherence-resolutions',getAllIncoherence);
		}
		
		var getAllIncoherence=function(coherenceName,outil,target,allIncoherences,responses){
			that.responses=responses;
			// On ne prend en compte l'evenement que si on sur cette coherence
			if(coherenceName==that.parametres.coherenceClass.coherence){
				addListe(allIncoherences);
			
				work();
			}
		}
		
		var showModalValidation=function(){
			that.coherenceCheck=[];
			var checkedIncoherences=that._listeResolutions.find('.validationCheckbox:checked');
			
			if(checkedIncoherences.length > 0){
				checkedIncoherences.each(function(){
					that.coherenceCheck.push($(this).attr('elemid'));
				});
				
				that._modalValidation.modalResolutions('show',that.responses);
			}else{
				printError("Vous devez sélectionner au moins une incoherence.");
			}
		}
		
		var valider=function(responses){
			wait();
			
			var allResponses=[];
			$.each(that.coherenceCheck,function(index,elemid){
				allResponses.push({
					id: elemid,
					responses: responses
				});
			});
			
			if(responses.length > 0){
				that.coherence.validerMulti(allResponses);
			}else{
				printError("Erreur lors de la validation.");
			}
		}
		
		var loadListePropositions=function(){
			that._listeResolutions.empty();
			
			wait();
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				if(that.coherence!=null){
					var allIncoherence=that.coherence.loadAllIncoherence();
				}
			},100);
		}
		
		var addListe=function(incoherences){
			var listeIncoherence=$("<ul>");
			
			function SortByLabel(a, b){
				var aName = a.label.toLowerCase();
				var bName = b.label.toLowerCase(); 
				return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
			}

			incoherences.sort(SortByLabel);
			
			$.each(incoherences,function(index,incoherence){
				var li=$("<li>",{"class":"list-group-item"});
				li.append($("<input>",{'class' : "validationCheckbox", 'type' : 'checkbox',"elemId" : incoherence.id}));
				
				li.append($("<span>").text(incoherence.label));
				
				listeIncoherence.append(li);
			});
			that._listeResolutions.empty();
			that._listeResolutions.append(listeIncoherence);
		}
		
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._error.hide();
								that._spinner.show();
								that._button.hide();
								that._listeResolutions.hide();
								break;
				case "work" : 	that._error.hide();
								that._spinner.hide();
								that._button.show();
								that._listeResolutions.show();
				    			break;
				case "error" : 	that._error.show();
								that._spinner.hide();
								that._button.show();
								that._listeResolutions.show();
				    			break;
				default : 	that._error.show();
							that._spinner.hide();
							that._button.show();
							that._listeResolutions.show();
    		    			break;
			}
		}
		
		var printError=function(txt){
			that._error.text(txt);
			setStatus("error");
			
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
		
		
		var methods={};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.coherenceResolutions' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);