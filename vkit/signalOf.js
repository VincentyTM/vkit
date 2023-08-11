(function($, undefined){

var createSignal = $.signal;
var isSignal = $.isSignal;
var observe = $.observe;
var onUnmount = $.unmount;

function signalOf(obj, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return signalOf(obj, prop);
			}
		});
	}
	
	var value = obj[prop];
	
	if( isSignal(value) ){
		return value;
	}
	
	var observable = observe(obj, prop);
	
	if(!observable){
		throw new ReferenceError("Property '" + prop + "' does not exist!");
	}
	
	var signal = createSignal(obj[prop]);
	var set = signal.set;
	
	signal.set = function(value){
		obj[prop] = value;
	};
	
	onUnmount(
		observable.subscribe(set)
	);
	
	return signal;
}

$.signalOf = signalOf;
$.stateOf = signalOf;

})($);
