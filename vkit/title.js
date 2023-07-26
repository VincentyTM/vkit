(function($, undefined){

var createState = $.state;
var inject = $.inject;
var unmount = $.unmount;
var WindowService = $.windowService;

function getTitle(parts, title){
	var n = parts.length;
	
	for(var i=0; i<n; ++i){
		var part = parts[i];
		
		if( part && typeof part.get === "function" ){
			part = part.get();
		}
		
		switch(typeof part){
			case "function":
				title = part(title);
				break;
			case "string":
				title = part;
				break;
		}
	}
	
	return title;
}

function TitleService(){
	var windowService = inject(WindowService);
	var document = windowService.window.document;
	var titleParts = createState([]);
	var originalTitle = document.title;
	
	function updateTitle(){
		document.title = getTitle(titleParts.get(), originalTitle);
	}
	
	this.title = titleParts.map(function(parts){
		return getTitle(parts, originalTitle);
	});
	this.titleParts = titleParts;
	this.updateTitle = updateTitle;
	
	titleParts.effect(updateTitle);
}

function addTitle(titlePart){
	var windowService = inject(WindowService);
	var titleService = windowService.titleService;
	
	if(!titleService){
		var provider = windowService.provider;
		provider.registerService(TitleService);
		titleService = inject(TitleService, provider);
	}
	
	if( titlePart === undefined ){
		return titleService.title;
	}
	
	var titleParts = titleService.titleParts;
	
	if( titlePart && typeof titlePart.subscribe === "function" ){
		titlePart.subscribe(titleService.updateTitle);
	}
	
	titleParts.set(
		titleParts.get().concat([titlePart])
	);
	
	unmount(function(){
		var parts = titleParts.get();
		
		for(var i=parts.length; i--;){
			if( parts[i] === titlePart ){
				titleParts.set(
					parts.slice(0, i).concat(
						parts.slice(i + 1)
					)
				);
				break;
			}
		}
	});
}

$.title = addTitle;

})($);
