(function($){

var validate = $.validate;
var createState = $.state;

function createTypedState(type, initialValue, transform){
	if(!validate(type, initialValue)){
		throw new TypeError("Validation failed.");
	}
	
	function validateValue(value){
		return validate(type, value);
	}
	
	function setValue(value){
		if(!validate(type, value)){
			throw new TypeError("Validation failed.");
		}
		if( transform ){
			value = transform(value);
		}
		set.call(state, value);
	}
	
	var state = createState(initialValue);
	var set = state.set;
	state.set = setValue;
	state.validate = validateValue;
	return state;
}

$.typedState = createTypedState;

})($);
