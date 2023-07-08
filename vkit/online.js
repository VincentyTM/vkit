(function($){

var createState = $.state;
var getWindow = $.window;
var onEvent = $.onEvent;
var unmount = $.unmount;

function createOnlineState(win){
	if(!win){
		win = getWindow();
	}
	
	var nav = win.navigator;
	
	var state = createState(nav.onLine !== false);
	
	function emitOnline(){
		state.set(true);
	}
	
	function emitOffline(){
		state.set(false);
	}
	
	unmount(onEvent(win, "online", emitOnline));
	unmount(onEvent(win, "offline", emitOffline));
	
	return state.map();
}

$.online = createOnlineState;

})($);
