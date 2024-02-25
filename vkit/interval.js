(function($) {

var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var update = $.update;

var slice = Array.prototype.slice;

function createInterval(callback, delay) {
	if (typeof callback !== "function") {
		throw new Error("Interval callback must be a function");
	}
	
	var win = getWindow();
	var args = slice.call(arguments, 2);
	
	function tick() {
		callback.apply(null, args);
		update();
	}
	
	function clear() {
		win.clearInterval(interval);
	}
	
	var interval = win.setInterval(tick, delay);
	
	onUnmount(clear);
}

$.interval = createInterval;

})($);
