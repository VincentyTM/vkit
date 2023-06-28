(function($){

var createState = $.state;
var getWindow = $.window;
var onEvent = $.onEvent;
var unmount = $.unmount;

function createFocusState(win){
	if(!win){
		win = getWindow();
	}
	
	var state = createState(win.document.hasFocus());
	
	function focus(){
		state.set(true);
	}
	
	function blur(){
		state.set(false);
	}
	
	unmount(onEvent(win, "blur", blur));
	unmount(onEvent(win, "focus", focus));
	
	return state.map();
}

$.focusState = createFocusState;

})($, window);
