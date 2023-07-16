(function($){

function emitUnmount(component){
	var unmount = component.unmount;
	
	if( unmount ){
		unmount();
		component.unmount = null;
	}
}

$.emitUnmount = emitUnmount;

})($);
