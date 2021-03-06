(function($){
	// Parametre par defaut
	var defauts={
		coherence : null,
		data:null,
		answer : "?",
		propositions : null
	};


	$.fn.CheckBoxForm=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var CheckBoxForm=$(this).data('CheckBoxForm');
			if (typeof CheckBoxForm === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				CheckBoxForm=$.CheckBoxForm($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=CheckBoxForm.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('CheckBoxForm',CheckBoxForm);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};



	$.CheckBoxForm=function(that,methodOrOptions){
		that.blacklist=[];
		
		var initialize = function(){
			printContent();
			initEvent();
			return that;
		};
		
		var printContent=function(){
			that.empty();
			if(that.parametres.data!=null){
				that._input=$("<div>",{id:that.parametres.coherence,name:that.parametres.coherence});
			
				
				$.each(that.parametres.data, function(index,input){
					that._input.append(
						$("<div>",{"class":"checkbox"}).append([
                         	$('<label>'
							    +'<input type="checkbox" name="checkbox-'+that.parametres.coherence+'" value="'+input.id+'">'
							    +input.label
							  +'</label>')
                        ])
					);
				});
				
				that.append([
				    $("<div>").append(
				    	$("<span>").text(that.parametres.answer)
				    ),     
				    that._input
			    ]);

				if(that.parametres.propositions!=null){
					var proposition=that.parametres.propositions.shift();
					if(proposition!=null && proposition!="" && "id" in proposition){
						that._input.find("input[value='"+proposition.id+"']").attr("checked",true);
					}
				}
			}else{
				that.trigger("print-error","Problème lors de la récupération des Autocomplete.");
			}
			
			return that;
		}
		
		var getResult=function(){
			var result=[that._input.find("input[type='checkbox']:checked").val()];
			
			return result;
		}
		
		var initEvent=function(){
			// Suppression de l'ancien event avant d'en ajouter un nouveau
			that.unbind("reload");
			
			// Ajout du nouveau event
			that.on("reload",function(evt,coherence,data,answer,propositions){
				reload(coherence,data,answer,propositions);
			});
			
			
		}
		
		/**
		 * Recharge le plugin avec de nouveau parametre
		 */
		var reload=function(coherence,data,answer,propositions){
			that.parametres.coherence=coherence;
			that.parametres.data=data;
			that.parametres.answer=answer;
			that.parametres.propositions=propositions;
			
			printContent();
			
			return that;
		}
		
		var methods={
			getResult : function(){ return getResult()}
		};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.CheckBoxForm' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);