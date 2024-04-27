(function($) {

var computed = $.computed;
var get = $.get;
var isWritableSignal = $.isWritableSignal;
var objectAssign = $.objectAssign;
var writable = $.writable;

function propertySignal(parent, key, defaultValue) {
	if (!isWritableSignal(parent)) {
		throw new TypeError("Parent of a property signal must be a writable signal");
	}
	
	function selectValue(state, key) {
		if (state === undefined) {
			throw new TypeError("Object must not be undefined");
		}
		
		if (state === null) {
			throw new TypeError("Object must not be null");
		}
		
		var current = state[key];
		
		if (current !== undefined) {
			return current;
		}
		
		if (defaultValue === undefined) {
			throw new TypeError("Property '" + key + "' does not exist and there is no default value provided");
		}
		
		return defaultValue;
	}
	
	function set(value) {
		var oldState = parent.get();
		var currentKey = get(key);
		var current = selectValue(oldState, currentKey);
		
		if (current !== value) {
			var newState = objectAssign({}, oldState);
			newState[currentKey] = value;
			parent.set(newState);
		}
	}
	
	var result = computed(selectValue, [parent, key]);
	return writable(result, set);
}

$.propertySignal = propertySignal;

})($);
