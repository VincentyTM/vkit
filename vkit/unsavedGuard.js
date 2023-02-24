(function($, window){

var unmount = $.unmount;
var onEvent = $.onEvent;

function prevent(e){
	if( e && e.preventDefault ){
		e.preventDefault();
	}
	return "";
}

function unsavedGuard(win){
	unmount(
		onEvent(win || window, "beforeunload", prevent)
	);
}

$.unsavedGuard = unsavedGuard;

})($, window);
