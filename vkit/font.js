(function($, document){

var createState = $.state;
var getComponent = $.getComponent;
var render = $.render;
var unmount = $.unmount;

function renderFont(){
	return null;
}

function createFont(name, url, onError, doc){
	if( typeof name !== "string" ){
		throw new TypeError("Font name must be a string");
	}
	
	if(!doc){
		doc = document;
	}
	
	var fontFaceState = createState(null);
	
	if(!(doc.fonts && typeof FontFace === "function")){
		if( typeof onError === "function" ){
			onError(new Error("FontFace API is not supported"));
		}
		
		return fontFaceState;
	}
	
	function setFont(url){
		var fontFace = fontFaceState.get();
		
		if( fontFace ){
			doc.fonts["delete"](fontFace);
		}
		
		fontFaceState.set(null);
		
		if( url ){
			var fontFace = new FontFace(name, "url(" + url + ")");
			doc.fonts.add(fontFace);
			doc.fonts.load("1em " + name).then(function(array){
				for(var i=array.length; i--;){
					if( array[i] === fontFace ){
						fontFaceState.set(fontFace);
						break;
					}
				}
				render();
			}, function(error){
				if( typeof onError === "function" ){
					onError(error);
				}
				render();
			});
		}
	}
	
	if( url && typeof url.effect === "function" ){
		url.effect(setFont);
	}else{
		setFont(url);
	}
	
	function remove(){
		setFont(null);
	}
	
	if( getComponent(true) ){
		unmount(remove);
	}
	
	var result = fontFaceState.map();
	result.remove = remove;
	result.render = renderFont;
	return result;
}

$.font = createFont;

})($, document);
