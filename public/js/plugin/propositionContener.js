(function($){
	// Parametre par defaut
	var defauts={
		"content" : [],
		"socket" : null
	};


	$.fn.propositionContener=function(methodOrOptions){
		var methodArgs=arguments;
		this.each(function(){
			var propositionContener=$(this).data('propositionContener');
			if (typeof propositionContener === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				propositionContener=$.propositionContener($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
				
				propositionContener.doPublicMethod(method,methodArgs);
			}
			
			$(this).data('propositionContener',propositionContener);
		});
		
		return this;
	};


	$.propositionContener=function(that,methodOrOptions){
		that.propositionName=null;
		
		that.propositionClass=null;
		
		that.tabLoadNbProposition=[];
		
		var initialize = function(){
			that._propositionMenu=$("<ul>",{"class":"nav navbar-nav"});
			that._propositionContent=$("<div>",{"class":"col-lg-10 ongletContent"});
			
			// On ajoute les listener socket io
			addListener();
			
			that.addClass("row propositionContener theContener").append([
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
							    that._propositionMenu
							])
						])
					])
				]),
				that._propositionContent
			]);
			
			$.each(that.parametres.content, function( name, value ) {
				addProposition(name,value);
			});
			
			setTimeout(function(){
				$.each(that.tabLoadNbProposition, function( index, callback ) {
					callback();
				});
			},300);
			
			return that;
		};
		
		var addListener=function(){
			that.parametres.socket.on('refresh-nb-proposition',function(propositionName,outil,target,nbProposition){
				// On ne prend en compte l'evenement que si on a cette proposition et quelle concerne le même outil et target
				if(propositionName in that.parametres.content && that.parametres.content[propositionName].outil==outil && that.parametres.content[propositionName].target==target)
					that._propositionMenu.find("li a[href='#"+propositionName+"'] .badge").empty().text(nbProposition);
			});
		}
		
		var addProposition=function(propositionName,proposition){
			var propositionLink=$("<a>",{"href":"#"+propositionName})
	    		.append([
	    		    $("<span>").text(proposition.label),
	    		    $("<span>",{"class":"glyphicon glyphicon-chevron-right pull-right"}),
	    		    $("<span>",{"class":"badge menu-badge pull-right"}).append(
	    		    	$("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate glyphicon-refresh-animate"})		
	    		    )
	    		])
	    		.on("click",function(){
		    		launchProposition(propositionName,proposition.outil,proposition.target,proposition.inputName,proposition.answer,proposition.pluginInput);
		    		
		    		inactiveMenu();
		    		$(this).parent().addClass("active");
	    		});
			
			
			that.tabLoadNbProposition.push(function(){
				var propositionClass=new PropositionUtile(that.parametres.socket,propositionName,proposition.outil,proposition.target);
				propositionClass.loadNbProposition();
			});
			
			that._propositionMenu.append(
				$("<li>").append([
				    propositionLink
				])
			);
			
			return that;
		}
		
		var inactiveMenu=function(){
			that._propositionMenu.find('li').each(function(){
				$(this).removeClass('active');
			});
		}
		
		var launchProposition=function(propositionName,outil,target,inputName,answer,pluginInput){
			var onglets=$("<ul>",{"class":"nav nav-tabs","role":"tablist"});
			var contents=$("<div>",{"class":"tab-content"});
			
			that._propositionContent.empty();
			
			that.propositionClass=new PropositionUtile(that.parametres.socket,propositionName,outil,target,inputName,answer,pluginInput);
			that.propositionName=propositionName;
		
			var pluginsDesc=[
			    {
			    	"title" : "Résolutions",
			    	"label" : "resolution",
			    	"content" : $("<div>").proposition({"propositionClass" : that.propositionClass,autoStart:true})
			    }           
			];
			
			
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
			

			that._propositionContent.append(
				$("<div>").append([
	               	onglets,
	               	contents
	            ])
	        );
			
			onglets.find('li a[href="#resolution"]').trigger('click');
		}
		
		var refresh=function(){
			// On met le badge en mode chargement
			that._propositionMenu.find("li a[href='#"+that.propositionName+"'] .badge")
				.empty()
				.append($("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate glyphicon-refresh-animate"}));
			
			// On lance le chargement du nombre de proposition
			that.propositionClass.loadNbProposition();
		}
		
		var methods={};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.propositionContener' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);