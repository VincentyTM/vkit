(function($, window){

var unmount = $.unmount;
var onEvent = $.onEvent;

function prevent(e){
	if( e && e.preventDefault ){
		e.preventDefault();
	}
	return "";
}

function unsavedGuard(){
	unmount(
		onEvent(window, "beforeunload", prevent)
	);
}

$.unsavedGuard = unsavedGuard;

})($, window);
