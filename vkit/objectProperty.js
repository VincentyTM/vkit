(function($) {

var effect = $.effect;
var get = $.get;
var isSignal = $.isSignal;
var observe = $.observe;
var onUnmount = $.onUnmount;
var signal = $.signal;

function objectProperty(object, property, defaultValue) {
	var value = signal(get(object)[get(property)]);
	var setEagerly = value.setEagerly;
	
	value.subscribe(function(v) {
		get(object)[get(property)] = v;
	});
	
	effect(function() {
		var o = isSignal(object) ? object() : object;
		var p = isSignal(property) ? property() : property;
		var change = observe(o, p);
		
		if (!change) {
			var type = typeof defaultValue;
			if (type === "function") {
				o[p] = defaultValue();
			} else if (type === "string" || type === "number" || type === "boolean" || type === "bigint" || defaultValue === null) {
				o[p] = defaultValue;
			} else {
				throw new Error("Property '" + p + "' does not exist and there is no default value provided");
			}
			change = observe(o, p);
		}
		
		onUnmount(change.subscribe(setEagerly));
		setEagerly(o[p]);
	});
	
	return value;
}

$.objectProperty = objectProperty;

})($);
