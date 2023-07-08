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

function initTitleParts(windowService){
	if( windowService.titleParts ){
		return windowService.titleParts;
	}
	
	return windowService.run(function(){
		var document = windowService.window.document;
		var titleParts = createState([]);
		var originalTitle = document.title;
		
		function updateTitle(){
			document.title = getTitle(titleParts.get(), originalTitle);
		}
		
		windowService.title = titleParts.map(function(parts){
			return getTitle(parts, originalTitle);
		});
		windowService.titleParts = titleParts;
		windowService.updateTitle = updateTitle;
		
		titleParts.effect(updateTitle);
		
		return titleParts;
	});
}

function addTitle(titlePart, dependencies){
	var windowService = inject(WindowService);
	
	if( titlePart === undefined ){
		return windowService.title;
	}
	
	var titleParts = initTitleParts(windowService);
	
	if( dependencies ){
		var n = dependencies.length;
		
		for(var i=0; i<n; ++i){
			dependencies[i].subscribe(windowService.updateTitle);
		}
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
