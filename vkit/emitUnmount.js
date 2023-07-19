(function($){

function emitUnmount(component){
	var children = component.children;
	if( children ){
		var n = children.length;
		
		for(var i=0; i<n; ++i){
			emitUnmount(children[i]);
		}
		
		component.children = null;
	}
	
	var unmount = component.unmount;
	
	if( unmount ){
		unmount();
		component.unmount = null;
	}
}

$.emitUnmount = emitUnmount;

})($);
