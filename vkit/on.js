(function($) {

var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function on(type, action) {
	return function(el) {
		onUnmount(onEvent(el, type, action));
	};
}

$.on = on;

})($);
