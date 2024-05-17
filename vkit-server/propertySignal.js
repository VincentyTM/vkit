import computed from "./computed.js";
import get from "./get.js";
import objectAssign from "./objectAssign.js";
import writable from "./writable.js";

export default function propertySignal(parent, key, defaultValue) {
    function selectValue(state, key) {
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
        var currentKey = get(key);
        var current = selectValue(oldState);
		
        if (current !== value) {
            var newState = objectAssign({}, oldState);
            newState[currentKey] = value;
            parent.set(newState);
        }
    }
	
    var result = computed(selectValue, [parent, key]);
    return writable(result, set);
}
