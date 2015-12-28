(function($){
	// Parametre par defaut
	var defauts={
		coherence : null,
		data:null,
		answer : "?",
		proposition : null
	};


	$.fn.OneInputForm=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var OneInputForm=$(this).data('OneInputForm');
			if (typeof OneInputForm === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				OneInputForm=$.OneInputForm($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=OneInputForm.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('OneInputForm',OneInputForm);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};



	$.OneInputForm=function(that,methodOrOptions){
		that.blacklist=[];
		
		var initialize = function(){
			that.addClass("oneInputForm");
			
			printContent();
			initEvent();
			return that;
		};
		
		var printContent=function(){
			that.empty();
			if(that.parametres.data!=null){
				that._input=$("<input>",{id:that.parametres.coherence,name:that.parametres.coherence,autocomplete:"off"});
				
				that._input.typeahead(
					{
						items : 9999999999,
						name: 'coherence',
						source: nameMatcher(that.parametres.data)
					}
				);
				
				that.append([
				    $("<div>").append(
				    	$("<span>").text(that.parametres.answer)
				    ),     
				    that._input
			    ]);
				
				if(that.parametres.proposition!=null && that.parametres.proposition!="" && "value" in that.parametres.proposition){
					that._input.val(that.parametres.proposition.value);
				}
			}else{
				that.trigger("print-error","Problème lors de la récupération des Autocomplete.");
			}
			
			return that;
		}
		
		var nameMatcher = function(strs) {
			return function findMatches(q, cb) {
				var matches, substringRegex;

				// an array that will be populated with substring matches
				matches = [];

				// regex used to determine if a string contains the substring `q`
				substrRegex = new RegExp(q, 'i');

				// iterate through the pool of strings and for any string that
				// contains the substring `q`, add it to the `matches` array
				$.each(strs, function(i, str) {
					if (substrRegex.test(str.name)) {
						matches.push(formatageName(str.name,str.id));
					}
				});

				cb(matches);
		    };
		};
		
		var formatageName=function(name,id){
			return name+" - ID : "+id;
		}
		
		var getResult=function(){
			return [that._input.val()];
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
				$.error( 'Method ' +  method + ' does not exist on jQuery.OneInputForm' );
			}
		}
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);