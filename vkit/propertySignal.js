(function($) {

var objectAssign = $.objectAssign;
var writable = $.writable;

function propertySignal(parent, key, defaultValue) {
    function selectValue(state) {
		if (state === undefined || state === null) {
			return state;
		}
		
        var current = state[key];
		
		if (current !== undefined) {
			return current;
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
