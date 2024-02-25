(function($) {

var update = $.update;

function preventDefault() {
	this.returnValue = false;
}

function stopPropagation() {
	this.cancelBubble = true;
}

function onEvent(target, type, listener) {
	function eventListener(e) {
		if (!e.preventDefault) {
			e.preventDefault = preventDefault;
		}
		
		if (!e.stopPropagation) {
			e.stopPropagation = stopPropagation;
		}
		
		var ret = listener.call(target, e);
		
		if (ret && typeof ret.then === "function") {
			ret.then(update);
		}
		
		update();
		
		return ret;
	}
	
	if (target.addEventListener) {
		target.addEventListener(type, eventListener, false);
		
		return function() {
			target.removeEventListener(type, eventListener, false);
		};
	} else if (target.attachEvent) {
		type = "on" + type;
		target.attachEvent(type, eventListener);
		
		return function() {
			target.detachEvent(type, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}

$.onEvent = onEvent;

})($);
