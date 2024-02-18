(function($) {

var onUnmount = $.onUnmount;
var signal = $.signal;
var valuesOf = $.valuesOf;

function not(value) {
	return !value;
}

function all(values) {
	var n = values.length;
	
	for (var i = 0; i < n; ++i) {
		if (!values[i]) {
			return false;
		}
	}
	
	return true;
}

function getValidities(validators) {
	var n = validators.length;
	var a = new Array(n);
	
	for (var i = 0; i < n; ++i) {
		a[i] = validators[i].valid;
	}
	
	return a;
}

function createValidatorGroup() {
	var inputs = signal(getValidities(arguments));
	var isValid = valuesOf(inputs).map(all);
	
	function add(validator) {
		var validity = validator.valid;
		
		inputs.set(inputs.get().concat([validity]));
		
		onUnmount(function() {
			var validities = inputs.get();
			
			for (var i = validities.length; i--;) {
				if (validities[i] === validity) {
					inputs.set(validities.slice(0, i).concat(validities.slice(i + 1)));
					break;
				}
			}
		});
		
		return validator;
	}
	
	return {
		add: add,
		valid: isValid,
		invalid: isValid.map(not)
	};
}

$.validatorGroup = createValidatorGroup;

})($);
