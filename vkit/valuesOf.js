(function($){

var createState = $.state;

function computeValues(states){
	var n = states.length;
	var args = new Array(n);
	
	for(var i=0; i<n; ++i){
		var state = states[i];
		args[i] = state && typeof state.get === "function" ? state.get() : state;
	}
	
	return args;
}

function valuesOf(stateOfStates){
	var output = createState();
	
	function update(){
		output.set(computeValues(stateOfStates.get()));
	}
	
	stateOfStates.effect(function(states, cleanup){
		var n = states.length;
		
		for(var i=0; i<n; ++i){
			var state = states[i];
			if( state && state.onChange && typeof state.onChange.subscribe === "function" ){
				cleanup(state.onChange.subscribe(update));
			}
		}
		
		update();
	});

	return output.map();
}

$.valuesOf = valuesOf;

})($);
