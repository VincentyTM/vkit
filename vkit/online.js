(function($) {

var computed = $.computed;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function online(win) {
	if(!win){
		win = getWindow();
	}
	
	var nav = win.navigator;
	var value = computed(function() {
		return nav.onLine !== false;
	});
	var update = value.update;
	
	onUnmount(onEvent(win, "online", update));
	onUnmount(onEvent(win, "offline", update));
	
	return value;
}

$.online = online;

})($);
