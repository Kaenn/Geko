/**
 * @TODO :
 * 		- Refresh quand on active purge 
 * 
 */
(function($){
	// Parametre par defaut
	var defauts={
		"content" : []
	};


	$.fn.purgeContener=function(methodOrOptions){
		var methodArgs=arguments;
		this.each(function(){
			var purgeContener=$(this).data('purgeContener');
			if (typeof purgeContener === "undefined") {
				// On initialise la classe
				var options=methodOrOptions;
			
				purgeContener=$.purgeContener($(this),options);
			}else{
				// On applique une method public sur la classe
				var method=methodOrOptions;
				
				purgeContener.doPublicMethod(method,methodArgs);
			}
			
			$(this).data('purgeContener',purgeContener);
		});
		
		return this;
	};


	$.purgeContener=function(that,methodOrOptions){
		that.activePurge=null;
		that.purgeName=null;
		
		that.tabLoadNbpurge=[];
		
		var initialize = function(){
			that._purgeMenu=$("<ul>",{"class":"nav navbar-nav"});
			that._purgeContent=$("<div>",{"class":"col-lg-10 purgeContent"});
			
			that.addClass("row purgeContener theContener").append([
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
							    that._purgeMenu
							])
						])
					])
				]),
				that._purgeContent
			]);
			
			$.each(that.parametres.content, function( index, value ) {
				addPurge(value);
			});
			
			setTimeout(function(){
				$.each(that.tabLoadNbpurge, function( index, callback ) {
					callback();
				});
			},300);
			
			return that;
		};
		
		var addPurge=function(purge){
			var purgeLink=$("<a>",{"href":"#"+purge.plugin})
	    		.append([
	    		    $("<span>").text(purge.name),
	    		    $("<span>",{"class":"glyphicon glyphicon-chevron-right pull-right"})
	    		])
	    		.on("click",function(){
		    		launchPurge(purge.plugin);
		    		
		    		inactiveMenu();
		    		$(this).parent().addClass("active");
	    		});
			
			
			that.tabLoadNbpurge.push(function(){
				var purgePlugin=$("<span>").purge({"purge":purge.plugin,"description":purge.description,autoStart:false});
				purgePlugin.purge("loadNbPurge",purgeLink,function(link,nb){
					link.append([
					    $("<span>",{"class":"badge menu-badge pull-right"}).text(nb)
					]);
				});
			});
			
			that._purgeMenu.append(
				$("<li>").append([
				    purgeLink
				])
			);
			
			return that;
		}
		
		var inactiveMenu=function(){
			that._purgeMenu.find('li').each(function(){
				$(this).removeClass('active');
			});
		}
		
		var launchPurge=function(purgeName){
			that._purgeContent.empty();
			
			that.activePurge=$("<div>").purge({"purge" : purgeName,autoStart:true});
			that.purgeName=purgeName;
			
			that.activePurge.unbind("refresh");
			that.activePurge.on("refresh",function(){
				refresh();
			});
			
			that.listElemPurge=$("<div>",{"class":"listPurge"});
			
			that._purgeContent.append([
               	that.activePurge
            ]);
		}
		
		var refresh=function(){
			var purgeBadge=that._purgeMenu.find("li a[href='#"+that.purgeName+"'] .badge");
			purgeBadge.empty();
			purgeBadge.append($("<span>",{"class":"glyphicon glyphicon-refresh glyphicon-refresh-animate glyphicon-refresh-animate"}));
			that.activePurge.purge("loadNbPurge",purgeBadge,function(badge,nb){
				badge.empty();
				badge.text(nb);
			});
		}
		
		var methods={};
		
		that.doPublicMethod=function(method,args){
			if ( methods[method] ) {
				return methods[ method ].apply( that, Array.prototype.slice.call( args, 1 ));
			} else{
				$.error( 'Method ' +  method + ' does not exist on jQuery.purgeContener' );
			}
		}
		
		
		// Prise en compte des options utilisateurs
		$.extend(that.parametres={},defauts,methodOrOptions);
		return initialize();
		
    };
})(jQuery);