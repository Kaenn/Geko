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
		
		that.coherenceCheck=[];
		
		var initialize = function(){
			that.empty();
			
			if(that.parametres.coherenceClass!=null){
				that.coherence=that.parametres.coherenceClass;
			}
			
			that.addClass("listIncoherence");
			
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"}).hide();
			that._listePropositions=$("<div>");
			
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
			    that._spinner,
			    that._button,
			    that._listePropositions,
			    that._modalValidation
			]);
			
			loadListePropositions();
			
			return that;
		};
		
		var showModalValidation=function(){
			that.coherenceCheck=[];
			var checkedIncoherences=that._listePropositions.find('.validationCheckbox:checked');
			
			if(checkedIncoherences.length > 0){
				checkedIncoherences.each(function(){
					that.coherenceCheck.push($(this).attr('elemid'));
				});
				
				that._modalValidation.modalResolutions('show');
			}else{
				console.log("ToDo : message d'erreur si aucun check");
			}
				
		}
		var sleep=function(milliseconds) {
			  var start = new Date().getTime();
			  for (var i = 0; i < 1e7; i++) {
			    if ((new Date().getTime() - start) > milliseconds){
			      break;
			    }
			  }
			}
		
		var valider=function(reponses){
			wait();
			
			var nbToValidate=0;
			var nbValidate=0;
			$.each(that.coherenceCheck,function(index,elemid){
				nbToValidate++;
				that.coherence.valider(elemid,reponses,function(){
					nbValidate++;
					
					if(nbToValidate==nbValidate){
						loadListePropositions();
						
						that.trigger('refresh');
					}
				});
			});
		}
		
		var loadListePropositions=function(){
			that._listePropositions.empty();
			
			wait();
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				if(that.coherence!=null){
					var allIncoherence=that.coherence.loadAllIncoherence(function(incoherences){
						addListe(incoherences);
						
						work();
					});
				}
			},100);
		}
		
		var addListe=function(incoherences,proposition){
			var listeIncoherence=$("<ul>");
			
			function SortByElem(a, b){
				var aName = a.elem.toLowerCase();
				var bName = b.elem.toLowerCase(); 
				return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
			}

			incoherences.sort(SortByElem);
			
			$.each(incoherences,function(index,incoherence){
				var li=$("<li>",{"class":"list-group-item"});
				li.append($("<input>",{'class' : "validationCheckbox", 'type' : 'checkbox',"elemId" : incoherence.id}));
				
				li.append($("<span>").text(incoherence.name));
				
				listeIncoherence.append($("<li>",{"class":"list-group-item"}).append([
				    $("<input>",{'class' : "validationCheckbox", 'type' : 'checkbox', "elemId" : incoherence.elemId}),
				    $("<span>").text(incoherence.elem)
				]));
			});
			
			that._listePropositions.append(listeIncoherence);
		}
		
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._spinner.show();
								that._button.hide();
								that._listePropositions.hide();
								break;
				case "work" : 	that._spinner.hide();
								that._button.show();
								that._listePropositions.show();
				    			break;
				default : 	that._spinner.hide();
							that._button.show();
							that._listePropositions.show();
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