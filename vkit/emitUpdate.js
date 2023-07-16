(function($){

function emitUpdate(component){
	if(!component.shouldUpdate){
		return;
	}
	
	component.emitUpdate();
	
	if( component.stopUpdate ){
		return;
	}
	
	var children = component.children;
	var n = children.length;
	
	for(var i=0; i<n; ++i){
		emitUpdate(children[i]);
	}
}

$.emitUpdate = emitUpdate;

})($);
