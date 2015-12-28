(function($){
	// Parametre par defaut
	var defauts={
		coherence : null,
		data:null,
		answer : "?",
		proposition : null
	};


	$.fn.RadioForm=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var RadioForm=$(this).data('RadioForm');
			if (typeof RadioForm === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				RadioForm=$.RadioForm($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=RadioForm.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('RadioForm',RadioForm);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};



	$.RadioForm=function(that,methodOrOptions){
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
						$("<div>",{"class":"radio"}).append([
                         	$('<label>'
							    +'<input type="radio" name="radio-'+that.parametres.coherence+'" value="'+input.value+'">'
							    +input.text
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
				
				if(that.parametres.proposition!=null && that.parametres.proposition!="" && "value" in that.parametres.proposition){
					that._input.find("input[value='"+that.parametres.proposition.value+"']").attr("checked",true);
				}
			}else{
				that.trigger("print-error","Problème lors de la récupération des Autocomplete.");
			}
			
			return that;
		}
		
		var getResult=function(){
			var result=[that._input.find("input[type='radio']:checked").val()];
			
			return result;
		}
		
		var initEvent=function(){
			// Suppression de l'ancien event avant d'en ajouter un nouveau
			that.unbind("reload");
			
			// Ajout du nouveau event
			that.on("reload",function(evt,coherence,data,answer,proposition){
				reload(coherence,data,answer,proposition);
			});
			
			
		}
		
		/**
		 * Recharge le plugin avec de nouveau parametre
		 */
		var reload=function(coherence,data,answer,proposition){
			that.parametres.coherence=coherence;
			that.parametres.data=data;
			that.parametres.answer=answer;
			that.parametres.proposition=proposition;
			
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
				$.error( 'Method ' +  method + ' does not exist on jQuery.RadioForm' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);