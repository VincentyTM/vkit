(function($, window){

var createState = $.state;
var unmount = $.unmount;
var onEvent = $.onEvent;

function createFocusState(win){
	if(!win){
		win = window;
	}
	var state = createState(win.document.hasFocus());
	function focus(){
		state.set(true);
	}
	function blur(){
		state.set(false);
	}
	unmount( onEvent(win, "blur", blur) );
	unmount( onEvent(win, "focus", focus) );
	return state.map();
}

$.focusState = createFocusState;

})($, window);
