(function($){
	// Parametre par defaut
	var defauts={
		"purge" : null,
		"description" : "",
		"autoStart" : true
	};


	$.fn.purge=function(methodOrOptions){
		var methodArgs=arguments;
		
		var allReturnMethod=[];
		this.each(function(){
			var purge=$(this).data('purge');
			if (typeof purge === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				purge=$.purge($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
			
				var returnMethod=purge.doPublicMethod(method,methodArgs);
				if(returnMethod!=null){
					allReturnMethod.push(returnMethod);
				}
			}
			
			$(this).data('purge',purge);
		});
		if(allReturnMethod.length > 0) return allReturnMethod;
		return this;
	};


	$.purge=function(that,methodOrOptions){
		// Regroupe les serveurs passé
		that.blacklist=[];
		
		var initialize = function(){
			if(that.parametres.purge!=null && that.parametres.purge!=""){
				// on instancie la classe de la purge
				if(that.parametres.autoStart)
					printPurge();
				else
					printStart();
			}
			
			return that;
		};
		
		var printStart=function(){
			that.empty();
			
			that.append(
				$('<div>',{"class":"row"}).append(
			    	$("<button>",{"class":"btn btn-default"}).text("Trouver purge").on("click",function(){
			    		printPurge();
			    	})
				)
			);
			
			return that;
		}
		
		var printPurge=function(impacts){
			that.empty();
			
			that._spinner=$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate"});
			that._form=$('<div>',{"class":"row"});
			
			that.append([
			    $('<div>',{"class":"row"}).append(
		    		$('<div>',{"class":"well"}).append([
		    		    that._spinner,
		    		    that._form
		    		])
			    )
			]);
			
			instancierPurge(function(impacts){
				that._form.append([
				    $("<h4>").text(that.parametres.description),
				    $("<span>",{"style" : "margin-right : 30px; margin-left : 10px;"}).text("Nombre de lignes inutiles : "+impacts),
       			    $("<button>",{"class":"btn btn-default","disabled":(impacts<=0)}).text("Purger").on("click",function(){
   			    		purge();
   			    	})
       		    ]);
				setStatus("work");
			});
			
			return that;
		}
		
		var instancierPurge=function(callback){
			setStatus("wait");
			
			// Ajout d'un timeout pour afficher le wait (sinon blqouer par les requetes ajax)
			setTimeout(function(){
				getImpacts(callback);
			},100);
			
			return that;
		}
		
		var getImpacts=function(callback){
			$.ajax({
				dataType: "json",
				method : "GET",
				url: "ajax/getImpactsPurge.php",
				data: { purge: that.parametres.purge}
			}).done(function(data){
				if("success" in data){
					callback(data.success);
				}
			});
		}
		
		var loadNbPurge=function(obj,callback){
			getImpacts(function(nb){
				callback(obj,nb);
			});
		}
		
		var setStatus=function(status){
			switch(status){
				case "wait" : 	that._spinner.show();
				    			that._form.hide();
								break;
				case "work" : 	that._spinner.hide();
				    			that._form.show();
				    			break;
				default : 	that._spinner.hide();
    		    			that._form.hide();
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
		
		
		var purge = function(){
			setStatus("wait");
			
			setTimeout(function(){
				// recupère les reultats
				// C'est un tableau car le plugin marche par groupe , il retourne donc les results du groupe
				$.ajax({
					dataType: "json",
					method : "GET",
					url: "ajax/purge.php",
					data: { purge: that.parametres.purge}
				}).done(function(data){
					if("success" in data){
						if(data.success){
							initialize();
							
							that.trigger('refresh');
						}
					}
				});
			},100);
			
			return that;
		}
		
		var methods={
			loadNbPurge :  function(obj,callback){ return loadNbPurge(obj,callback); },
		};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.purge' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);