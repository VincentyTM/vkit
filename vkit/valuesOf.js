(function($) {

var readOnly = $.readOnly;
var signal = $.signal;

function computeValues(states) {
	var n = states.length;
	var args = new Array(n);
	
	for (var i = 0; i < n; ++i) {
		var state = states[i];
		args[i] = state && typeof state.get === "function" ? state.get() : state;
	}
	
	return args;
}

function valuesOf(stateOfStates){
	var output = signal();
	
	function update() {
		output.set(computeValues(stateOfStates.get()));
	}
	
	stateOfStates.effect(function(states) {
		var n = states.length;
		
		for (var i = 0; i < n; ++i) {
			var state = states[i];
			
			if (state && typeof state.subscribe === "function") {
				state.subscribe(update);
			}
		}
		
		update();
	});

	return readOnly(output);
}

$.valuesOf = valuesOf;

})($);
