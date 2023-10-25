(function($) {

var effect = $.effect;
var get = $.get;
var isSignal = $.isSignal;
var observe = $.observe;
var onUnmount = $.onUnmount;
var signal = $.signal;

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

function objectProperty(object, property, defaultValue) {
	var obj = get(object);
	var prop = get(property);
	var value = signal(obj ? obj[prop] : getDefaultValue(defaultValue, prop));
	var setEagerly = value.setEagerly;
	
	value.subscribe(function(v) {
		get(object)[get(property)] = v;
	});
	
	effect(function() {
		var o = isSignal(object) ? object() : object;
		var p = isSignal(property) ? property() : property;
		
		if (o === null || o === undefined) {
			setEagerly(getDefaultValue(defaultValue, p));
			return;
		}
		
		var change = observe(o, p);
		
		if (!change) {
			o[p] = getDefaultValue(defaultValue, p);
			change = observe(o, p);
		}
		
		onUnmount(change.subscribe(setEagerly));
		setEagerly(o[p]);
	});
	
	return value;
}

$.objectProperty = objectProperty;

})($);
