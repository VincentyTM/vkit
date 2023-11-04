(function($){

var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var observe = $.observe;
var onUnmount = $.onUnmount;

function getValue(object, property) {
	var value = object[property];
	var component = getComponent(true);
	
	if (!component) {
		return value;
	}
	
	var observable = observe(object, property);
	
	if (!observable) {
		throw new ReferenceError("Property '" + property + "' does not exist!");
	}
	
	var enqueued = false;
	var render = component.render;
	
	function set(newValue) {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(updateOf);
			}
		}
	}
	
	function updateOf() {
		enqueued = false;
		render();
	}
	
	onUnmount(
		observable.subscribe(set)
	);
	
	return value;
}

var handler = {
	get: getValue
};

function of(object) {
	if (!object || !(typeof object === "object" || typeof object === "function")) {
		return object;
	}
	
	return new Proxy(object, handler);
}

$.of = of;

})($);
