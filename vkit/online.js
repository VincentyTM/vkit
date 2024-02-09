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
	var invalidate = value.invalidate;
	
	onUnmount(onEvent(win, "online", invalidate));
	onUnmount(onEvent(win, "offline", invalidate));
	
	return value;
}

$.online = online;

})($);
