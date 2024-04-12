(function($){

var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var observe = $.observe;
var onUnmount = $.onUnmount;

function getDefaultValue(defaultValue, prop) {
	var type = typeof defaultValue;
	
	if (type === "function") {
		return defaultValue();
	}
	
	if (type === "string" || type === "number" || type === "boolean" || type === "bigint" || defaultValue === null) {
		return defaultValue;
	}
	
	throw new Error("Property '" + prop + "' does not exist and there is no default value provided");
}

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

function of(object, property, defaultValue) {
	if (!object || !(typeof object === "object" || typeof object === "function")) {
		return object;
	}
	
	if (typeof property === "string") {
		if (!(property in object)) {
			object[property] = getDefaultValue(defaultValue, property);
		}
		
		return getValue(object, property);
	}
	
	var component = getComponent(true);
	
	if (!component) {
		return object;
	}
	
	return new Proxy(object, handler);
}

$.of = of;

})($);
