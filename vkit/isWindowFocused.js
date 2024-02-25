(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function isWindowFocused() {
	var win = getWindow();
	var doc = win.document;
	
	var focused = computed(function() {
		return doc.hasFocus();
	});
	
	onUnmount(onEvent(win, "blur", focused.invalidate));
	onUnmount(onEvent(win, "focus", focused.invalidate));
	
	return focused;
}

$.isWindowFocused = isWindowFocused;

})($);
