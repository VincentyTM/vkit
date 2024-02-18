(function($, undefined) {

var isSignal = $.isSignal;
var observe = $.observe;
var onUnmount = $.onUnmount;
var signal = $.signal;

function signalOf(obj, prop) {
	if (prop === undefined) {
		if (typeof Proxy !== "function") {
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		
		return new Proxy(obj, {
			get: function(obj, prop, receiver) {
				return signalOf(obj, prop);
			}
		});
	}
	
	var value = obj[prop];
	
	if (isSignal(value)) {
		return value;
	}
	
	var change = observe(obj, prop);
	
	if (!change) {
		throw new ReferenceError("Property '" + prop + "' does not exist!");
	}
	
	var sig = signal(obj[prop]);
	var set = sig.set;
	
	sig.set = function(value) {
		obj[prop] = value;
	};
	
	onUnmount(
		change.subscribe(set)
	);
	
	return sig;
}

$.signalOf = signalOf;
$.stateOf = signalOf;

})($);
