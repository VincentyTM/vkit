(function($, undefined) {

function patchMethod(signal, reducer) {
	return function() {
		var value = reducer.apply(signal.get(), arguments);
		
		if (value !== undefined) {
			signal.set(value);
		}
	};
}

function createActions(signal, reducers, actions) {
	if (!actions) {
		actions = {};
	}
	
	if (reducers) {
		for (var name in reducers) {
			if (name in actions) {
				throw new Error("Cannot set key '" + name + "': it already exists");
			}
			
			actions[name] = patchMethod(signal, reducers[name]);
		}
	}
	
	return actions;
}

$.action = patchMethod;
$.actions = createActions;

})($);
