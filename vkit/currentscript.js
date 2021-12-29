(function($, document){

function getCurrentScript(){
	if( document.currentScript ){
		return document.currentScript;
	}
	var scripts = document.scripts;
	for(var i=scripts.length-1; i>=0; --i){
		var script=scripts[i];
		if(!script.readyState || script.readyState=="interactive"){
			return script;
		}
	}
	throw new ReferenceError("Current script not found!");
}

$.currentScript = getCurrentScript;

})($, document);
