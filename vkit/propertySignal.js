(function($) {

var objectAssign = $.objectAssign;
var writable = $.writable;

function propertySignal(parent, key, defaultValue) {
	if (!isWritableSignal(parent)) {
		throw new TypeError("Parent of a property signal must be a writable signal");
	}
	
    function selectValue(state) {
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
        var current = selectValue(oldState);
		
        if (current !== value) {
            var newState = objectAssign({}, oldState);
            newState[key] = value;
            parent.set(newState);
        }
    }
	
    var result = parent.map(selectValue);
    return writable(result, set);
}

$.propertySignal = propertySignal;

})($);
