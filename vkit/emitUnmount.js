(function($){

function emitUnmount(component){
	var children = component.children;
	var emitDestroy = component.emitDestroy;
	
	for(var i=children.length; i--;){
		emitUnmount(children[i]);
	}
	
	emitDestroy();
	emitDestroy.clear();
}

$.emitUnmount = emitUnmount;

})($);
