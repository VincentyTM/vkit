(function($){

var validate = $.validate;
var createSignal = $.signal;

function createTypedSignal(type, initialValue, transform){
	if(!validate(type, initialValue)){
		throw new TypeError("Validation failed.");
	}
	
	if( typeof transform === "function" ){
		initialValue = transform(initialValue);
	}
	
	function validateValue(value){
		return validate(type, value);
	}
	
	function setValue(value){
		if(!validate(type, value)){
			throw new TypeError("Validation failed.");
		}
		
		if( typeof transform === "function" ){
			value = transform(value);
		}
		
		set.call(signal, value);
	}
	
	var signal = createSignal(initialValue);
	var set = signal.set;
	
	signal.set = setValue;
	signal.validate = validateValue;
	
	return signal;
}

$.typed = createTypedSignal;

})($);
