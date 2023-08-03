(function($){

var createSignal = $.signal;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.unmount;

function isWindowFocused(win){
	if(!win){
		win = getWindow();
	}
	
	var state = createSignal(win.document.hasFocus());
	
	function focus(){
		state.set(true);
	}
	
	function blur(){
		state.set(false);
	}
	
	onUnmount(onEvent(win, "blur", blur));
	onUnmount(onEvent(win, "focus", focus));
	
	return state.map();
}

$.isWindowFocused = isWindowFocused;

})($, window);
