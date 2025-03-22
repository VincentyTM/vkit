(function($) {

var getEffect = $.getEffect;
var onDestroy = $.onDestroy;
var onEvent = $.onEvent;

function on(type, action) {
	var outer = getEffect(true);
	
	return function(el) {
		var inner = getEffect(true);
		
		if (!inner && outer) {
			getEffect();
		}
		
		var unsubscribe = onEvent(el, type, action);
		
		if (outer !== inner) {
			onDestroy(unsubscribe);
		}
	};
}

$.on = on;

})($);
