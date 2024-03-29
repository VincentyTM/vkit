(function($) {

var getComponent = $.getComponent;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function on(type, action) {
	var outer = getComponent(true);
	
	return function(el) {
		var inner = getComponent(true);
		
		if (!inner && outer) {
			getComponent();
		}
		
		var unsubscribe = onEvent(el, type, action);
		
		if (outer !== inner) {
			onUnmount(unsubscribe);
		}
	};
}

$.on = on;

})($);
