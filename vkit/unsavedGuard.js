(function($, window){

var unmount = $.unmount;
var onEvent = $.onEvent;

function prevent(e){
	if( e && e.preventDefault ){
		e.preventDefault();
	}
	return "";
}

function unsavedGuard(state, win){
	if(!win) win = window;
	var unsubscribe = null;
	
	function add(){
		if(!unsubscribe){
			unsubscribe = onEvent(win, "beforeunload", prevent);
			++unsavedGuard.count;
		}
	}
	
	function remove(){
		if( unsubscribe ){
			unsubscribe();
			unsubscribe = null;
			--unsavedGuard.count;
		}
	}
	
	function update(value){
		value ? add() : remove();
	}
	
	state && state.map ? state.map(Boolean).effect(update) : add();
	unmount(remove);
	return state;
}

unsavedGuard.count = 0;

$.unsavedGuard = unsavedGuard;

})($, window);
