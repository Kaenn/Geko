(function($){
	// Parametre par defaut
	var defauts={
		"content" : [],
		"socket" : null
	};


	$.fn.coherenceContener=function(methodOrOptions){
		var methodArgs=arguments;
		this.each(function(){
			var coherenceContener=$(this).data('coherenceContener');
			if (typeof coherenceContener === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				coherenceContener=$.coherenceContener($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
				
				coherenceContener.doPublicMethod(method,methodArgs);
			}
			
			$(this).data('coherenceContener',coherenceContener);
		});
		
		return this;
	};


	$.coherenceContener=function(that,methodOrOptions){
		that.activeCoherence=null;
		that.coherenceName=null;
		
		that.coherenceClass=null;
		
		that.tabLoadNbincoherence=[];
		
		var initialize = function(){
			that._coherenceMenu=$("<ul>",{"class":"nav navbar-nav"});
			that._coherenceContent=$("<div>",{"class":"col-lg-10 coherenceContent"});
			
			// On ajoute les listener socket io
			addListener();
			
			that.addClass("row coherenceContener theContener").append([
				$("<div>",{"class":"col-lg-2","id":"menu"}).append([
					$("<div>",{"class":"sidebar-nav"}).append([
						$("<div>",{"class":"navbar navbar-default","role":"navigation"}).append([
							$("<div>",{"class":"navbar-header"}).append([
								$("<button>",{"type":"button","class":"navbar-toggle","data-toggle":"collapse","data-target":".sidebar-navbar-collapse"}).append([
									$("<span>",{"class":"sr-only"}).text("Toggle navigation"),
									$("<span>",{"class":"icon-bar"}),
									$("<span>",{"class":"icon-bar"}),
									$("<span>",{"class":"icon-bar"})
								]),
								$("<span>",{"class":"visible-xs navbar-brand"}).text("Sidebar menu")
							]),
							$("<div>",{"class":"navbar-collapse collapse sidebar-navbar-collapse"}).append([
							    that._coherenceMenu
							])
						])
					])
				]),
				that._coherenceContent
			]);
			
			$.each(that.parametres.content, function( name, value ) {
				addCoherence(name,value);
			});
			
			setTimeout(function(){
				$.each(that.tabLoadNbincoherence, function( index, callback ) {
					callback();
				});
			},300);
			
			return that;
		};
		
		var addListener=function(){
			that.parametres.socket.on('refresh-nb-incoherence',function(coherenceName,outil,target,nbIncoherence){
				// On ne prend en compte l'evenement que si on a cette coherence et quelle concerne le même outil et target
				if(coherenceName in that.parametres.content && that.parametres.content[coherenceName].outil==outil && that.parametres.content[coherenceName].target==target)
					that._coherenceMenu.find("li a[href='#"+coherenceName+"'] .badge").empty().text(nbIncoherence);
			});
		}
		
		var addCoherence=function(coherenceName,coherence){
			var coherenceLink=$("<a>",{"href":"#"+coherenceName})
	    		.append([
	    		    $("<span>").text(coherence.label),
	    		    $("<span>",{"class":"glyphicon glyphicon-chevron-right pull-right"}),
	    		    $("<span>",{"class":"badge menu-badge pull-right"}).append(
	    		    	$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate glyphicon-refresh-animate"})		
	    		    )
	    		])
	    		.on("click",function(){
		    		launchCoherence(coherenceName,coherence.outil,coherence.target,coherence.inputName,coherence.answer,coherence.answerMultiple,coherence.pluginInput,coherence.plugins);
		    		
		    		inactiveMenu();
		    		$(this).parent().addClass("active");
	    		});
			
			
			that.tabLoadNbincoherence.push(function(){
				var coherenceClass=new CoherenceUtile(that.parametres.socket,coherenceName,coherence.outil,coherence.target);
				coherenceClass.loadNbIncoherence();
			});
			
			that._coherenceMenu.append(
				$("<li>").append([
				    coherenceLink
				])
			);
			
			return that;
		}
		
		var inactiveMenu=function(){
			that._coherenceMenu.find('li').each(function(){
				$(this).removeClass('active');
			});
		}
		
		var launchCoherence=function(coherenceName,outil,target,inputName,answer,answerMultiple,pluginInput,plugins){
			var onglets=$("<ul>",{"class":"nav nav-tabs","role":"tablist"});
			var contents=$("<div>",{"class":"tab-content"});
			
			that._coherenceContent.empty();
			
			that.coherenceClass=new CoherenceUtile(that.parametres.socket,coherenceName,outil,target,inputName,answer,answerMultiple,pluginInput);
			that.coherenceName=coherenceName;
		
			var pluginsDesc=[
			    {
			    	"title" : "Résolutions",
			    	"label" : "resolution",
			    	"content" : $("<div>").coherence({"coherenceClass" : that.coherenceClass,autoStart:true})
			    }           
			];
			
			if($.inArray("propositions",plugins)>-1){
				pluginsDesc.push({
			    	"title" : "Propositions",
			    	"label" : "propositions",
			    	"content" : $("<div>").coherencePropositions({"coherenceClass" : that.coherenceClass})
			    });
			}
			
			if($.inArray("resolutionsMultiple",plugins)>-1){
				pluginsDesc.push({
			    	"title" : "Résolutions multiple",
			    	"label" : "resolutionsMultiple",
			    	"content" : $("<div>").coherenceResolutions({"coherenceClass" : that.coherenceClass})
			    });
			}
			
			
			// Création des onglets et de leur contenu
			$.each(pluginsDesc,function(index,desc){
				onglets.append(
					$("<li>",{"role":"presentation"}).append([
		      			$("<a>",{"href":"#"+desc.label,"aria-controls":"resolution","role":"tab","data-toggle":"tab"})
		      				.text(desc.title)
		      		])
				);
				
				contents.append(
					$("<div>",{"role":"tabpanel","class":"tab-pane","id":desc.label}).append(
	           			desc.content
					)
				);
				
				desc.content.unbind("refresh");
				desc.content.on("refresh",function(){
					refresh();
				});
			});
			

			that._coherenceContent.append(
				$("<div>").append([
	               	onglets,
	               	contents
	            ])
	        );
			
			onglets.find('li a[href="#resolution"]').trigger('click');
		}
		
		var refresh=function(){
			// On met le badge en mode chargement
			that._coherenceMenu.find("li a[href='#"+that.coherenceName+"'] .badge")
				.empty()
				.append($("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate glyphicon-refresh-animate"}));
			
			// On lance le chargement du nombre d'incoherence
			that.coherenceClass.loadNbIncoherence();
		}
		
		var methods={};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.coherenceContener' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);