(function($){
	// Parametre par defaut
	var defauts={
		"coherenceClass" : null
	};


	$.fn.coherencePropositions=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var coherencePropositions=$(this).data('coherencePropositions');
			if (typeof coherencePropositions === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				coherencePropositions=$.coherencePropositions($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=coherencePropositions.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('coherencePropositions',coherencePropositions);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.coherencePropositions=function(that,methodOrOptions){
		that.coherence=null;
		
		var initialize = function(){
			that.empty();
			
			// On ajoute les listener socket io
			addListener();
			
			that.addClass("listIncoherence");
			
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"}).hide();
			that._listePropositions=$("<div>");

			that.append([
			    that._spinner,
			    that._listePropositions
			]);
			
			askListePropositions();
			
			return that;
		};
		
		var addListener=function(){
			that.parametres.coherenceClass.socket.on('get-all-incoherence',function(coherenceName,outil,target,allIncoherence){
				// On ne prend en compte l'evenement que si on sur cette coherence
				if(coherenceName==that.parametres.coherenceClass.coherence)
					loadListePropositions(allIncoherence);
			});
		}
		
		/**
		 * Demande au serveur de charger toutes les incoherences
		 */
		var askListePropositions=function(){
			that._listePropositions.empty();
			
			wait();
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				if(that.parametres.coherenceClass!=null){
					that.coherence=that.parametres.coherenceClass;
	
					that.coherence.loadAllIncoherence();
				}
			},100);
		}
		
		var loadListePropositions=function(incoherences){
			var incoherencesByProposition={};
			var incoherencesUnknown=[];
			
			$.each(incoherences, function(index,incoherence){
				if("elem" in incoherence){
					var proposition="Inconnu";
					if("proposition" in incoherence){
						proposition=incoherence.proposition;
						
						// On initialise la liste si elle n'existe pas
						if(! (proposition in incoherencesByProposition) ){
							incoherencesByProposition[proposition.value]=proposition;
							
							incoherencesByProposition[proposition.value]["incoherences"]=[];
						}
						
						incoherencesByProposition[proposition.value]["incoherences"].push({"name" : incoherence.label, "id" : incoherence.id});
					}else{
						incoherencesUnknown.push({"name" : incoherence.elem, "id" : incoherence.elemId});
					}
				}
			});

			var haveProposition=false;
			$.each(incoherencesByProposition, function(proposition , propositionDesc){
				haveProposition=true;
				addListeProposition(propositionDesc.incoherences,propositionDesc.value,propositionDesc.text);
			});
			
			if(haveProposition){
				that._listePropositions.append($("<button>",{'type':"button", 'class':"btn btn-default"})
					.text("Valider les propositions selectionné")
				    .on("click",function(){
						$(this).attr('disabled',true);
						that._listePropositions.find('.validationCheckbox')
							.attr('disabled',true)
							.each(function(){
								if($(this).is(":checked")){
									var elemId=$(this).attr("elemId");
									var proposition=$(this).attr("proposition");
									
									if(elemId!=null && elemId > 0 && proposition!=null && proposition!=""){
										var checkbox=$(this);
										that.coherence.valider(elemId,[proposition],function(isValidate){
											if(isValidate){
												var theCheckbox=checkbox;
												// On cache la ligne
												theCheckbox.parent().hide();
												
												// On cache les listes de propositions qui n'ont plus de ligne
												that._listePropositions.find("ul").each(function(){
													if($(this).find("li:visible").length <= 0){
														$(this).parent().hide();
													}
												});
											}
										});
									}
								}
							})
							.attr('disabled',false);
						that.trigger("refresh");
						$(this).attr('disabled',false);
				    })
				);
			}
			
			addListeProposition(incoherencesUnknown,"unknown","Inconnue");
			
			work();
		}
		
		var addListeProposition=function(incoherences,proposition_value,proposition_text){
			var listeIncoherence=$("<ul>");
			
			function SortByName(a, b){
				var aName = a.name.toLowerCase();
				var bName = b.name.toLowerCase(); 
				return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
			}

			incoherences.sort(SortByName);
		
			$.each(incoherences,function(index,incoherence){
				var li=$("<li>",{"class":"list-group-item"});
				if(proposition_value!="unknown"){
					li.append($("<input>",{'class' : "validationCheckbox", 'type' : 'checkbox','name' : proposition_value+'_'+index,"elemId" : incoherence.id,"proposition" : proposition_value}));
				}
				
				li.append($("<span>").text(incoherence.name));
				
				listeIncoherence.append(li);
			});
			
			
			that._listePropositions.append(
				$("<div>").append([
				    $("<h1>").append([
				        $("<span>").text(proposition_text),
				        $("<span>",{"class":"badge menu-badge","style" : "margin-left : 10px;"}).text(incoherences.length)
				    ]),
				    listeIncoherence
			    ])
			);
		}
		
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._spinner.show();
								that._listePropositions.hide();
								break;
				case "work" : 	that._spinner.hide();
								that._listePropositions.show();
				    			break;
				default : 	that._spinner.hide();
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
				$.error( 'Method ' +  method + ' does not exist on jQuery.coherencePropositions' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);