(function($){

var createSignal = $.signal;
var getComponent = $.getComponent;
var observe = $.observe;
var onUnmount = $.onUnmount;

function getValue(object, property){
	var value = object[property];
	
	if(!getComponent(true)){
		return value;
	}
	
	var observable = observe(object, property);
	
	if(!observable){
		throw new ReferenceError("Property '" + property + "' does not exist!");
	}
	
	var signal = createSignal(object[property]);
	
	onUnmount(
		observable.subscribe(signal.set)
	);
	
	return signal();
}

var handler = {
	get: getValue
};

function of(object){
	return new Proxy(object, handler);
}

$.of = of;

})($);
