(function($) {

var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var update = $.update;

var slice = Array.prototype.slice;

function createTimeout(callback, delay) {
	if (typeof callback !== "function") {
		throw new Error("Timeout callback must be a function");
	}
	
	var win = getWindow();
	var args = slice.call(arguments, 2);
	
	function tick() {
		callback.apply(null, args);
		update();
	}
	
	function clear() {
		win.clearTimeout(timeout);
	}
	
	var timeout = win.setTimeout(tick, delay);
	
	onUnmount(clear);
}

$.timeout = createTimeout;

})($);
